const express = require('express');
const router = express.Router();
const conn = require('../config/config')


// Fetch Application Downloaded User
router.get("/viewDownloadedMember", (req, res) => {
    const qry = `SELECT id, name,email,mobile,
    address,download_date FROM application_download
    order by application_download.id DESC`;
  
    conn.query(qry, (err, result) => {
        if (err) {
            console.error("Error getting the data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data fetched successfully");
        res.status(200).json({ message: "Data fetched successfully", result });
    });
  });
  
  // Endpoint to delete Application Downloaded User
  router.delete("/deleteDownloadedAplication/:downloadid", (req, res) => {
    const downloadid = req.params.downloadid;
  
    const sql = `DELETE FROM application_download WHERE id = ?`;
  
    conn.query(sql, [downloadid], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.status(200).json({ message: "User deleted successfully" });
        }
    });
  });


  router.get("/viewOnlineApplication", (req, res) => {
    const qry = `select * from online_application
    order by online_application.id DESC`;
  
    conn.query(qry, (err, result) => {
        if (err) {
            console.error("Error getting the data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data fetched successfully");
        res.status(200).json({ message: "Data fetched successfully", result });
    });
  });
  
//   router.get("/fetchOnlineApplication", (req, res) => {
//     const qry = `select * from online_application
//     order by online_application.id DESC`;
  
//     conn.query(qry, (err, result) => {
//         if (err) {
//             console.error("Error getting the data:", err);
//             return res.status(500).json({ error: "Internal Server Error" });
//         }
//         console.log("Data fetched successfully");
//         res.status(200).json({ message: "Data fetched successfully", result });
//     });
//   });

  router.get("/fetchOnlineApplication", (req, res) => {
    const id = req.query.id; // Capture 'id' from URL query parameters
    if (!id) {
        return res.status(400).json({ error: "Missing ID parameter" });
    }

    // Query to fetch data based on the id
    const qry = `SELECT * FROM online_application WHERE id = ?`;
  
    conn.query(qry, [id], (err, result) => {
        if (err) {
            console.error("Error getting the data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "No record found for this ID" });
        }

        console.log("Data fetched successfully");
        res.status(200).json({ message: "Data fetched successfully", result });
    });
});

  


  // Endpoint to delete Application Downloaded User
  router.delete("/deleteviewOnlineApplication/:onlineid", (req, res) => {
    const onlineid = req.params.onlineid;
  console.log(onlineid,"click api");
    const sql = `DELETE FROM online_application WHERE id = ?`;
    
  
    conn.query(sql, [onlineid], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.status(200).json({ message: "User deleted successfully" });
        }
    });
  });


  // Endpoint to fetch contacted members
router.get("/viewcontactedmember", (req, res) => {
    const qry = `SELECT 
        contactadmin.id,
        contactadmin.title,
        contactadmin.message,
        th_user.username
    FROM 
        contactadmin 
    JOIN 
        th_user 
    ON 
        contactadmin.user_fk = th_user.user_pk
    ORDER BY 
          contactadmin.id DESC`;
  
    conn.query(qry, (err, result) => {
        if (err) {
            console.error("Error getting the data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data fetched successfully");
        res.status(200).json({ message: "Data fetched successfully", result });
    });
  });
  
  // Endpoint to delete contacted member
  router.delete("/deleteUserContactedMember/:contacteduserId", (req, res) => {
    const contacteduserId = req.params.contacteduserId;
  
    const sql = `DELETE FROM contactadmin WHERE id = ?`;
  
    conn.query(sql, [contacteduserId], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.status(200).json({ message: "User deleted successfully" });
        }
    });
  });



  // Fetch Application Downloaded User
router.get("/viewcontactus", (req, res) => {
    const qry = `SELECT id, name,email,mobile_no, subject,message FROM contact_us
    order by contact_us.id DESC
`;
  
    conn.query(qry, (err, result) => {
        if (err) {
            console.error("Error getting the data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data fetched successfully");
        res.status(200).json({ message: "Data fetched successfully", result });
    });
  });
  
  // Endpoint to delete Application Downloaded User
  router.delete("/deletecontactus/:contactusid", (req, res) => {
    const downloadid = req.params.downloadid;
  
    const sql = `DELETE FROM contact_us WHERE id = ?`;
  
    conn.query(sql, [downloadid], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.status(200).json({ message: "User deleted successfully" });
        }
    });
  });


module.exports = router;