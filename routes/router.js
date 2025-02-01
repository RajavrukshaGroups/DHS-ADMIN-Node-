const express = require('express');
const { route } = require('./UserRouting');
const router = express.Router();
const session = require('express-session');
const conn = require("../config/config");
const userController = require('../controllers/userController.js');



router.use(session({
  // secret: 'your_secret_key', 
  secret: 'i9v0HvxFgUxNz4g24nApRkRr48CwZa89', 
  // Replace with your actual secret key
  resave: false,
  saveUninitialized: true
}));

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // User is authenticated, proceed
  }
  res.redirect('/login'); // Redirect to login if not authenticated
}


// Middleware to set userName in locals
router.use((req, res, next) => {
  res.locals.userName = req.session.user ? req.session.user.name : null;
  next();
});


// Public routes (accessible without login)
router.get('/viewonlyrec', (req, res) => {
  res.render('receiptviewonly');
});

router.get('/confirmationletterviewonly', (req, res) => {
  res.render('confirmationletterviewonly');
});

router.get('/viewonlysharecer', (req, res) => {
  res.render('viewonlysharecer');
});

router.get("/viewerreceiptview/:receiptId", (req, res) => {
  const receiptId = req.params.receiptId;
  const sql = `
    SELECT DISTINCT
    th_receipt.receipt_pk AS 'receipt_id',
    th_receipt.created_date AS 'Created Date',
    th_receipt.receipt_no AS 'Receipt Number',
    th_user.username AS 'User Name',
    CONCAT(th_user.username, ', Member_ID: ', th_user.senior_id) AS 'Member Details',
    th_user.user_address AS 'Member Address',
    th_projects.pro_name AS 'Project Name',
    th_receipt.payment_mode AS 'Payment Mode',
    th_receipt.transaction_id AS 'Transaction Id',
    th_receipt.payment_amnt AS 'Payment Amount',
    th_receipt.cheque_no AS 'Cheque No',
    th_receipt.dd_no AS 'DD No',
    th_receipt.bank_name AS 'Bank Name',
    th_receipt.branch AS 'Branch Name',
    th_user_extra_charges.paid_amount AS 'Paid Amount',
    th_user_project.prop_dimension AS 'Property Dimension',
    th_receipt.adv_amnt_amount As 'Advance Amount',
    th_receipt.payment_type as 'Payment Type',
    th_receipt.cheque_dd_transaction_id  as 'Chequetransdd',
    th_receipt.cr_installment as "Installments",
    CASE
        WHEN th_receipt.status = 0 THEN 'Active'
        WHEN th_receipt.status = 1 THEN 'Inactive'
        ELSE 'Cancelled'
    END AS 'Status',
    th_receipt.share_fee AS 'Share Fee',
    th_receipt.member_fee AS 'Membership Fee',
    mrd.site_down_payment AS 'Site Down Payment',
    mrd.site_advance_payment AS 'Site Advance Amount',
    th_receipt.share AS 'Share',
    th_receipt.admission_fee AS 'Admission Fee',
    th_receipt.miscellaneous AS 'Miscellaneous',
    mrd.first_installment AS 'First Installment',
    mrd.second_installment AS 'Second Installment',
    mrd.third_installment AS 'Third Installment',
    mrd.fourth_installment AS 'Fourth Installment',
    th_receipt.application_fee As 'Application Fee',
    mrd.others_charges AS 'Other Charges'

FROM
    th_receipt
LEFT JOIN
    th_user_project ON th_receipt.user_project_fk = th_user_project.project_fk
LEFT JOIN
    th_projects ON th_user_project.project_fk = th_projects.project_id
LEFT JOIN
    th_user ON th_receipt.user_fk = th_user.member_pid
LEFT JOIN
    th_installment ON th_receipt.installment_fk = th_installment.installment_pk
LEFT JOIN
    th_user_extra_charges ON th_user_extra_charges.user_fk = th_user.member_pid
        AND th_user_extra_charges.user_project_fk = th_user_project.project_fk
LEFT JOIN
    members_receipt_details AS mrd ON mrd.receipt_id = th_receipt.receipt_pk

WHERE
    th_receipt.receipt_pk = ?`;

  conn.query(sql, [receiptId], (err, results) => {
    if (err) {
      console.error("Error fetching receipt details:", err);
      res.status(500).json({ error: "Error fetching data" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Receipt not found" });
      return;
    }

    // Return receipt data for the specified ID
    res.status(200).json(results[0]);
  });
});
// /viewerreceiptview/:receiptId
// router.get("/gen_conn_view", (req, res) => {
//   const { user_pk } = req.query;
//   const user_data_query = `SELECT * FROM confirmation WHERE id = ?`;

//   conn.query(user_data_query, [user_pk], (err, result) => {
//     if (err) {
//       console.error("Error getting the data:", err);
//       res.status(500).json({ error: "Error getting the data" });
//     } else {
//       if (result.length > 0) {
//         console.log("Data fetched successfully");
//         res.status(200).json({ message: "Data fetched successfully", result });
//       } else {
//         res.status(404).json({ error: "No data found for the given user ID" });
//       }
//     }
//   });
// });

router.get("/gen_conn_view", (req, res) => {
  const { user_pk } = req.query;

  // Join query to get data from the confirmation and th_user tables
  const user_data_query = `
    SELECT confirmation.*, th_user.comformation_no,th_user.mr_mrs_ms
    FROM confirmation
    JOIN th_user ON confirmation.user_fk = th_user.user_pk
    WHERE confirmation.id = ${user_pk}
  `;

//   const user_data_query = `
//   SELECT confirmation.*, FORMAT(confirmation.name8, 0) AS name8, th_user.comformation_no, th_user.mr_mrs_ms
//   FROM confirmation
//   JOIN th_user ON confirmation.user_fk = th_user.user_pk
//   WHERE confirmation.id = ${user_pk}
// `;

  // Execute the SQL query
  conn.query(user_data_query, (err, result) => {
    if (err) {
      console.error("Error getting the data:", err);
      res.status(500).json({ error: "Error getting the data" });
    } else {
      console.log("Data fetched successfully");
      res.status(200).json({ message: "Data fetched successfully", result });
    }
  });
});

router.get("/gen_share_view", (req, res) => {
  const { user_pk } = req.query;
  console.log("this is your id : ", user_pk);
  const user_data_query = `SELECT * 
            FROM th_user 
            JOIN th_user_project 
            ON th_user.user_pk = th_user_project.user_fk 
            WHERE th_user.user_pk = ${user_pk};
            `;


  //    Execute the SQL query
  conn.query(user_data_query, (err, result) => {
    if (err) {
      console.error("Error getting the data:", err);
      res.status(500).json({ error: "Error getting the data" });
    } else {
      console.log("Data fetched successfully");
      res.status(200).json({ message: "Data fetched successfully", result });
      //   const membername = result[0].username;
      //   console.log("this is name : ",membername)
    }
  });
});

// Define your routes
// router.get('/', (req, res) => {
//   const userName = req.session.user ? req.session.user.name : null;
//   console.log("username",userName)

//   // res.render('home');
//       res.render('home', { userName });

// });

// router.get('/', (req, res) => {
//   const userName = req.session.user ? req.session.user.name : null;
//   res.render('home', { userName: userName });
// });


// router.get('/', (req, res) => {
//   res.render('home'); // Render home view without passing session
// });


// Apply authentication middleware for all other routes


router.use((req, res, next) => {
  if (['/viewonlyrec', '/confirmationletterviewonly', '/viewonlysharecer','/viewerreceiptview/:receiptId', '/gen_conn_view', '/gen_share_view', '/login'].includes(req.path)) {
    return next(); // Allow access to public routes and login without authentication
  }
  isAuthenticated(req, res, next); // Protect other routes
});

// Define your routes
router.get('/', (req, res) => {
  res.render('home', { userName: res.locals.userName });
});



router.use((req, res, next) => {
  const userName = req.session.user ? req.session.user.name : null;
  res.locals.userName = userName;
  next();
});


// router.get('/', (req, res) => {
//   res.render('home');
// });


router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM th_employee_details WHERE email_id = ? AND emp_epwd = ?';
  conn.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).json({ error: 'An internal server error occurred' });
      return;
    }
    if (results.length > 0) {
      req.session.user = { name: results[0].name };
      res.status(200).json({ redirectUrl: '/' });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/login');
  });
});

// project screen routings
router.get('/AddProjectDetails', (req, res) => {
  res.render('AddProjectDetails');
});


router.get('/viewLandDetails',(req,res)=>{
  res.render('viewLandDetails');
});

router.get('/viewPlotDimesion',(req,res)=>{
  res.render('viewPlotDimesion');
});



// New User route
router.get('/newuser', (req, res) => {
    res.render('newuser');
});


// Plot Transfer
router.get('/plotTransferForm', (req, res) => {
  res.render('plotTransferForm');
});

router.get('/AddExtraCharges', (req, res) => {
  res.render('AddExtrachargeForm');
});

router.get('/PlotCancellation', (req, res) => {
  res.render('PlotCanelForm');
});

router.get('/ManageRecieptAmount', (req, res) => {
  res.render('manageReceiptAMount');
});

router.get('/aff', (req, res) => {
  res.render('printAffidivate');
});

router.get('/rec',(req,res)=>{
  res.render('receipt')
})
 

router.get('/receipt',(req,res)=>{
  res.render('receiptCopy')
})

router.get('/sharecert',(req,res)=>{
  res.render('sharecertificate')
})


router.get('/confirm',(req,res)=>{
  res.render('confirmationLetter')
}

)

router.get('/viewuser',(req,res)=>{
  res.render('viewuser')
}

)


router.get('/viewmember',(req,res)=>{
  res.render('viewmember')
}

)

router.get('/viewreciept',(req,res)=>{
  res.render('viewreciept')
})


router.get('/view-sitebooking',(req,res)=>{
  res.render('view-sitebooking')
}

)


router.get('/editrec',(req,res)=>{
  res.render('editreceipt')
})


router.get('/viewhistory',(req,res)=>{
  res.render('viewhistory')
})
router.get('/newreceipt',(req,res)=>{
  res.render('new_receipt')
})

router.get('/login',(req,res)=>{
  res.render('login')
})

router.get('/viewUserExtraCharges',(req,res)=>{
  res.render('viewUser_extra_charges')
})

router.get('/viewExtraHistroy',(req,res)=>{
  res.render('viewExtra_histroy')
})

router.get('/viewinactivemember',(req,res)=>{
  res.render('viewInactivemember')
})

router.get('/plotTransferhistory',(req,res)=>{
  res.render('plotTransferhistory')
})

router.get('/viewplotcancel',(req,res)=>{
  res.render('plotcancelhistory')
})

router.get('/add_conn',(req,res)=>{
  res.render('Addconfirmationletter')
})

router.get('/viewshare',(req,res)=>{
  res.render('viewsharecer')
}) 


router.get('/pro_details',(req,res)=>{
  res.render('viewprojects')
})

// router.get('/viewonlyrec',(req,res)=>{
//   res.render('receiptviewonly')
// })

router.get('/viewcontactedmember',(req,res)=>{
res.render('viewcontactedmember')
})

router.get('/AddProjectStatus',(req,res) =>{
  res.render('AddProjectStatus')
})

router.get('/viewProjectStatus',(req,res)=>{
  res.render('ViewProjectStatus')
})

// router.get('/viewonlysharecer',(req,res)=>{
//   res.render('viewonlysharecer')
// })

// router.get('/confirmationletterviewonly',(req,res) =>{
//   res.render('confirmationletterviewonly')
// })

router.get('/viewdownloadapplication',(req,res) =>{
  res.render('viewdownloadapplication')
})

router.get('/viewcontactuswebsite',(req,res) =>{
  res.render('viewcontactuswebsite')
})

router.get('/viewonlineapllication',(req,res)=>{
  res.render('ViewonlineApplication')
})

router.get('/online',(req,res) =>{
  res.render('online')
})


router.post('/send-email',userController.Nodemailer);
router.get('/editViewuser', userController.editViewUser);
router.post("/editUser", userController.saveEditUser);
router.post("/deletViewplotcancel", userController.deletViewplotcancel);
router.get("/editProjectStatus/:id", userController.editProjectStatus);
router.get("/editAddExtraCharges/:id", userController.editAddExtraCharges);
router.post('/saveEditAddExtraCharges',userController.saveEditAddExtraCharges)
router.get('/editReciept/:receiptId',userController.editReciept)
router.post('/saveEditReciept',userController.saveEditReciept)
router.get('/editviewsitebooking/:id',userController.editviewsitebooking)
router.post('/saveEditSiteBooking',userController.saveEditSiteBooking)










module.exports = router;
