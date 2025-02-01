const express = require('express');
const router = express.Router();
const conn = require('../config/config');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const userController = require('../controllers/userController.js');



// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);  // Directory to save files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Unique filename
    }
});

const upload = multer({ storage: storage });





router.post('/addProject', (req, res) => {
  const { projectName, shortCode, status } = req.body;
  console.log(req.body)

  const sql = 'INSERT INTO th_projects (pro_name, short_code, status) VALUES (?, ?, ?)';
  const values = [projectName, shortCode, status];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into MySQL:', err);
      res.status(500).json({ status: 500, error: 'Error inserting data into database' });
      return;
    }
    console.log('Data inserted into MySQL successfully');
    res.status(200).json({ status: 200, message: 'Data inserted into database successfully' });
  });
});


router.post('/plotsize', (req, res) => {
  const { projectlength, projectbreadth } = req.body;
  console.log(req.body)
 

  const sql = 'INSERT INTO th_plotsize  (plotsize_width, plotsize_height) VALUES (?, ?)';
  const values = [projectlength, projectbreadth];
  console.log(values)

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into MySQL:', err);
      res.status(500).json({ status: 500, error: 'Error inserting data into database' });
      return;
    }
    console.log('Data inserted into MySQL successfully');
    res.status(200).json({ status: 200, message: 'Data inserted into database successfully' });
  });
}); 

router.post('/saveProjectLand', (req, res) => {
  const { projectDropdown, plotDimensionDropdown, plotAmount } = req.body;
  console.log(req.body)

  // Fetch project_fk based on selected project name
  const sqlFetchProjectId = 'SELECT project_pk FROM th_projects WHERE pro_name = ?';
  conn.query(sqlFetchProjectId, [projectDropdown], (err, results) => {
    if (err) {
      console.error('Error fetching project ID from MySQL:', err);
      res.status(500).json({status:500, error: 'Error fetching project ID from database' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({status:404, error: 'Project not found' });
      return;
    }

    const projectId = results[0].project_pk;
    console.log(projectId)
   

    // Fetch plotsize_fk based on selected plot dimension
    const [plotsizeWidth, plotsizeHeight] = plotDimensionDropdown.split('X');
    console.log(plotsizeWidth,plotsizeHeight)
    const sqlFetchPlotsizeId = 'SELECT plotsize_pk FROM th_plotsize WHERE plotsize_width = ? AND plotsize_height = ?';
    conn.query(sqlFetchPlotsizeId, [plotsizeWidth, plotsizeHeight], (err, results) => {
      if (err) {
        console.error('Error fetching plot size ID from MySQL:', err);
        res.status(500).json({ error: 'Error fetching plot size ID from database' });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({status:404, error: 'Plot size not found' });
        return;
      }

      const plotsizeId = results[0].plotsize_pk;
      console.log(plotsizeId)

      // Insert data into th_project_land table
      const sqlInsertProjectLand = 'INSERT INTO th_project_land (project_fk, plotsize_fk, plot_amount) VALUES (?, ?, ?)';
      const values = [projectId, plotsizeId, plotAmount];

      conn.query(sqlInsertProjectLand, values, (err, result) => {
        if (err) {
          console.error('Error inserting data into th_project_land:', err);
          res.status(500).json({status:505, error: 'Error inserting data into database' });
          return;
        }
        console.log('Data inserted into th_project_land table successfully');
        res.status(200).json({status:200, message: 'Data inserted into database successfully' });
      });
    }); 
  });
});

router.get('/projectNames', (req, res) => {
    const sql = 'SELECT pro_name,project_id FROM th_projects';
    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching project names:', err);
        res.status(500).json({ error: 'Error fetching project names' });
        return;
      }
      res.status(200).json(results);
    });
  });

  router.get('/plotDimensions', (req, res) => {
    const sql =  `SELECT plotsize_pk,
    CONCAT(plotsize_width, "X", plotsize_height) AS dimension,
    (plotsize_width * plotsize_height) AS property_size
    FROM th_plotsize`  ;
    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching plot dimensions:', err);
        res.status(500).json({ error: 'Error fetching plot dimensions' });
        return;
      }
      res.status(200).json(results);
    });
  });


  router.get('/projectLandData', (req, res) => {
    const sql = `
      SELECT pl.pro_land_pk AS 'S.No',
             p.pro_name AS 'Project Name',
             CONCAT(ps.plotsize_width, ' x ', ps.plotsize_height) AS 'Plot Size',
             pl.plot_amount AS 'Amount'
      FROM th_project_land pl
      JOIN th_projects p ON pl.project_fk = p.project_pk
      JOIN th_plotsize ps ON pl.plotsize_fk = ps.plotsize_pk
      ORDER BY pl.pro_land_pk DESC;
    `;
  
    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching project land data:', err);
        res.status(500).json({ error: 'Error fetching data' });
        return;
      }
  
      res.status(200).json(results);
    });
  });

  // router.get('/viewPlotdimension',(req,res)=>{
    
  // })


  router.get('/viewPlotdimension',(req,res)=>{
    const qry = `select plotsize_width,plotsize_height from th_plotsize 
    order by plotsize_pk DESC;`
    conn.query(qry, (err, results) => {
      if (err) {
        console.error('Error fetching project land data:', err);
        res.status(500).json({ error: 'Error fetching data' });
        return;
      }
  
      res.status(200).json(results);
    });
    
  })




  router.get('/prodetails',(req,res)=>{
    const qry = `SELECT pro_name,short_code,status from th_projects 
    order by project_pk DESC`;
    conn.query(qry, (err, results) => {
      if (err) {
        console.error('Error fetching project land data:', err);
        res.status(500).json({ error: 'Error fetching data' });
        return;
      }
  
      res.status(200).json(results);
    });
    
  })

// Add project status
router.post('/addProjectStatus', upload.array('fileupload'), (req, res) => {
    const { projectName, statusDate, statusTitle, statusDetails, notifications } = req.body;
    const files = req.files;
       // If notifications is an array, join its elements into a single string
       const notification_via = Array.isArray(notifications) ? notifications.join(', ') : notifications;


    const sql = 'INSERT INTO th_project_status (project_fk, title, `desc`, file, status_add_date ,notification_via) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [projectName, statusTitle, statusDetails, JSON.stringify(files.map(file => file.path)), statusDate, notification_via];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
            res.status(500).json({ status: 500, error: 'Error inserting data into database' });
            return;
        }
        console.log('Data inserted into MySQL successfully');
        res.status(200).json({ status: 200, message: 'Data inserted into database successfully' });
    });
});

router.get('/projectNamesInStatus', (req, res) => {
  const sql = 'SELECT pro_name,project_pk FROM th_projects';
  conn.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching project names:', err);
      res.status(500).json({ error: 'Error fetching project names' });
      return;
    }
    res.status(200).json(results);
  });
});

// view Project Status
router.get('/viewProjectStatus', (req, res) => {
  const sql = `
    SELECT 
    ps.pro_status_pk,
    p.pro_name AS 'Project Name',
    ps.title As 'Title',
    ps.desc As 'Description',
    ps.file As 'File',
    ps.status_add_date As 'Status Date',
    ps.notification_via As 'Notification'
FROM 
    th_project_status ps
INNER JOIN 
    th_projects p ON ps.project_fk = p.project_pk
  ORDER BY ps.pro_status_pk ASC;
  `;

  conn.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching project land data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }

    res.status(200).json(results);
  });
});


router.delete('/deleteProjectStatus/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM th_project_status WHERE pro_status_pk = ?';
  conn.query(sql, [id], (err, result) => {
      if (err) {
          console.error('Error deleting data from MySQL:', err);
          res.status(500).json({ status: 500, error: 'Error deleting data from database' });
          return;
      }

      if (result.affectedRows === 0) {
          res.status(404).json({ status: 404, message: 'Record not found' });
          return;
      }

      console.log('Data deleted from MySQL successfully');
      res.status(200).json({ status: 200, message: 'Data deleted from database successfully' });
  });
});

router.post('/editProjectStatusSave', upload.single('fileupload'), userController.editProjectSave);


  module.exports = router;
