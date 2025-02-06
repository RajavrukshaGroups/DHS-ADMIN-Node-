const express = require("express");
const router = express.Router();
const conn = require("../config/config");

// Route for displaying a message
router.post("/manageReceiptamount", (req, res) => {
  console.log("api hit");
  const { share, associate_member_fee, admission_fee, share_fee, total } =
    req.body;

  // Check if data exists in the database
  const checkQuery = `SELECT set_rec_id FROM th_manage_receipt`;
  conn.query(checkQuery, (err, result) => {
    if (err) {
      console.error("Error executing check query:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length > 0) {
      // If data exists, store 'set_rec_id' in a variable
      const setRecId = result[0].set_rec_id;
      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " "); // Get current date

      // Execute an update query
      const updateQuery = `
                UPDATE th_manage_receipt
                SET set_share = ${share},
                    set_associate_member_fee = ${associate_member_fee},
                    set_admission_fee = ${admission_fee},
                    set_share_fee = ${share_fee},
                    set_total = ${total} ,
                    updated_date='${currentDate}'
                WHERE set_rec_id = ${setRecId}`;

      conn.query(updateQuery, (err, result) => {
        if (err) {
          console.error("Error executing update query:", err);
          return res.status(500).send("Internal Server Error");
        }
        // res.send("Data updated successfully");
        console.log("Data updated successfully");
      });
    } else {
      // If data does not exist, insert the data into the database
      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " "); // Get current date
      const insertQuery = `
                INSERT INTO th_manage_receipt (set_share, set_associate_member_fee, set_admission_fee, set_share_fee, set_total ,created_date)
                VALUES (${share}, ${associate_member_fee}, ${admission_fee}, ${share_fee}, ${total} ,'${currentDate}')`;

      conn.query(insertQuery, (err, result) => {
        if (err) {
          console.error("Error executing insert query:", err);
          return res.status(500).send("Internal Server Error");
        }
        // res.send("Data inserted successfully");
        console.log("Data inserted successfully");
      });
    }
  });
});

// View Reciept

// router.get('receipt/viewerreceipt', (req, res) => {
//     const sql = `
//     SELECT
//         th_receipt.receipt_no AS 'Receipt Number',
//         th_receipt.rname AS 'Member Details',
//         th_projects.pro_name AS 'Project Name',
//         th_receipt.status AS 'Status'
//     FROM th_receipt
//     LEFT JOIN th_user_project ON th_receipt.user_project_fk = th_user_project.project_fk
//     LEFT JOIN th_projects ON th_user_project.project_fk = th_projects.project_id
//     ORDER BY th_receipt.receipt_no;
// `;

//     conn.query(sql, (err, results) => {
//       if (err) {
//         console.error('Error fetching viewer receipt data:', err);
//         res.status(500).json({ error: 'Error fetching data' });
//         return;
//       }

//       res.status(200).json(results);
//     });
//   });
// Handle GET requests to '/viewerreceipt'

router.get("/viewerreceipt", (req, res) => {
  const sql = `
SELECT
    tr.receipt_pk AS 'receipt_id',
    tr.created_date AS 'Created Date',
    tr.receipt_no AS 'Receipt Number',
    tu.username AS 'User Name',
    CONCAT(tu.username, ', Member_ID: ', tu.senior_id) AS 'Member Details',
    tu.user_address AS 'Member Address',
    tp.project_pk AS 'Project Pk',
    tp.pro_name AS 'Project Name',
    tr.payment_mode AS 'Payment Mode',
    tr.transaction_id AS 'Transaction Id',
    tr.payment_amnt AS 'Total Amount',
    tr.cheque_no AS 'Cheque No',
    tr.dd_no AS 'DD No',
    tr.bank_name AS 'Bank Name',
    tr.branch AS 'Branch Name',
    tec.paid_amount AS 'Paid Amount',
    tup.prop_dimension AS 'Property Dimension',
    tr.site_adv_amnt AS 'Site Advance Amount',
    tr.adv_amnt_amount AS 'Advance Amount',
    tr.payment_type AS 'Payment Type',
    tr.cheque_dd_transaction_id AS 'Chequetransdd',
    CASE
      WHEN tr.status = 0 THEN 'Active'
      WHEN tr.status = 1 THEN 'Inactive'
      ELSE 'Active'
    END AS 'Status',
    mrd.share_fee AS 'Share Fee',
    mrd.membership_fee AS 'Membership Fee',
    mrd.site_down_payment AS 'Site Down Payment',
    mrd.site_advance_payment AS 'Site Advance Amount',
    mrd.share AS 'Share',
    mrd.admission_fee AS 'Admission Fee',
    mrd.misellaneous AS 'Miscellaneous',
    mrd.first_installment AS 'First Installment',
    mrd.second_installment AS 'Second Installment',
    mrd.third_installment AS 'Third Installment',
    mrd.fourth_installment AS 'Fourth Installment',
    mrd.application_fee AS 'Application Fee',
    mrd.others_charges AS 'Other Charges',
    mpd.amount_in_words AS 'Amount In Words'
FROM
    th_receipt tr
LEFT JOIN th_user tu ON tr.user_fk = tu.member_pid
LEFT JOIN th_user_project tup ON tu.senior_id = tup.user_seniority_id
LEFT JOIN th_projects tp ON tup.project_fk = tp.project_id
LEFT JOIN th_user_extra_charges tec ON tec.user_fk = tu.member_pid AND tec.user_project_fk = tup.user_project_pk
LEFT JOIN (
    SELECT 
        receipt_id, 
        MAX(share_fee) AS share_fee, 
        MAX(membership_fee) AS membership_fee, 
        MAX(site_down_payment) AS site_down_payment, 
        MAX(site_advance_payment) AS site_advance_payment, 
        MAX(share) AS share, 
        MAX(admission_fee) AS admission_fee, 
        MAX(misellaneous) AS misellaneous, 
        MAX(first_installment) AS first_installment, 
        MAX(second_installment) AS second_installment, 
        MAX(third_installment) AS third_installment, 
        MAX(fourth_installment) AS fourth_installment, 
        MAX(application_fee) AS application_fee, 
        MAX(others_charges) AS others_charges
    FROM 
        members_receipt_details
    GROUP BY 
        receipt_id
) mrd ON mrd.receipt_id = tr.receipt_pk
LEFT JOIN (
    SELECT 
        receipt_no, 
        MAX(amount_in_words) AS amount_in_words
    FROM 
        members_payment_details
    GROUP BY 
        receipt_no
) mpd ON mpd.receipt_no = tr.receipt_no
ORDER BY tr.receipt_pk DESC
  `;

  conn.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching viewer receipt data:", err);
      res.status(500).json({ error: "Error fetching data" });
      return;
    }

    res.status(200).json(results);
  });
});

// Adjust the route for unauthenticated access
router.get("/viewerreceipt/:receiptId", (req, res) => {
  const receiptId = req.params.receiptId;

  const sql = `SELECT DISTINCT
      th_receipt.receipt_pk AS 'receipt_id',
      th_receipt.created_date AS 'Created Date',
      th_receipt.receipt_no AS 'Receipt Number',
      th_user.username AS 'User Name',
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
      th_receipt.payment_type as 'Payment Type',
      th_receipt.cheque_dd_transaction_id  as 'Chequetransdd',
      th_receipt.cr_installment as "Installments",
      th_receipt.share_fee AS 'Share Fee',
      th_receipt.member_fee AS 'Membership Fee',
      th_receipt.admission_fee AS 'Admission Fee',
      th_receipt.miscellaneous AS 'Miscellaneous',
      th_receipt.application_fee As 'Application Fee',
      th_receipt.raddress As 'Receipt Address'
            FROM
          th_receipt
          LEFT JOIN
          th_user ON th_receipt.user_fk = th_user.member_pid
      LEFT JOIN
          th_user_project ON th_user.senior_id = th_user_project.user_seniority_id
      LEFT JOIN
          th_projects ON th_user_project.project_fk = th_projects.project_id
      
      LEFT JOIN
          th_user_extra_charges ON th_user_extra_charges.user_fk = th_user.member_pid
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

    res.status(200).json(results[0]);
  });
});

// router.get("/viewerreceipt/:receiptId", (req, res) => {
//   const receiptId = req.params.receiptId;

//   const sql = `
//     SELECT DISTINCT
//     th_receipt.receipt_pk AS 'receipt_id',
//     th_receipt.created_date AS 'Created Date',
//     th_receipt.receipt_no AS 'Receipt Number',
//     th_user.username AS 'User Name',
//     CONCAT(th_user.username, ', Member_ID: ', th_user.senior_id) AS 'Member Details',
//     th_user.user_address AS 'Member Address',
//     th_projects.pro_name AS 'Project Name',
//     th_receipt.payment_mode AS 'Payment Mode',
//     th_receipt.transaction_id AS 'Transaction Id',
//     th_receipt.payment_amnt AS 'Payment Amount',
//     th_receipt.cheque_no AS 'Cheque No',
//     th_receipt.dd_no AS 'DD No',
//     th_receipt.bank_name AS 'Bank Name',
//     th_receipt.branch AS 'Branch Name',
//     th_user_extra_charges.paid_amount AS 'Paid Amount',
//     th_user_project.prop_dimension AS 'Property Dimension',
//     th_receipt.adv_amnt_amount As 'Advance Amount',
//     th_receipt.payment_type as 'Payment Type',
//     th_receipt.cheque_dd_transaction_id  as 'Chequetransdd',
//     th_receipt.cr_installment as "Installments",
//     CASE
//         WHEN th_receipt.status = 0 THEN 'Active'
//         WHEN th_receipt.status = 1 THEN 'Inactive'
//         ELSE 'Cancelled'
//     END AS 'Status',
//     th_receipt.share_fee AS 'Share Fee',
//     th_receipt.member_fee AS 'Membership Fee',
//     mrd.site_down_payment AS 'Site Down Payment',
//     mrd.site_advance_payment AS 'Site Advance Amount',
//     th_receipt.share AS 'Share',
//     th_receipt.admission_fee AS 'Admission Fee',
//     th_receipt.miscellaneous AS 'Miscellaneous',
//     mrd.first_installment AS 'First Installment',
//     mrd.second_installment AS 'Second Installment',
//     mrd.third_installment AS 'Third Installment',
//     mrd.fourth_installment AS 'Fourth Installment',
//     th_receipt.application_fee As 'Application Fee',
//     mrd.others_charges AS 'Other Charges'

// FROM
//     th_receipt
// LEFT JOIN
//     th_user_project ON th_receipt.user_project_fk = th_user_project.project_fk
// LEFT JOIN
//     th_projects ON th_user_project.project_fk = th_projects.project_id
// LEFT JOIN
//     th_user ON th_receipt.user_fk = th_user.member_pid
// LEFT JOIN
//     th_installment ON th_receipt.installment_fk = th_installment.installment_pk
// LEFT JOIN
//     th_user_extra_charges ON th_user_extra_charges.user_fk = th_user.member_pid
//         AND th_user_extra_charges.user_project_fk = th_user_project.project_fk
// LEFT JOIN
//     members_receipt_details AS mrd ON mrd.receipt_id = th_receipt.receipt_pk

// WHERE
//     th_receipt.receipt_pk = ?`;

//   conn.query(sql, [receiptId], (err, results) => {
//     if (err) {
//       console.error("Error fetching receipt details:", err);
//       res.status(500).json({ error: "Error fetching data" });
//       return;
//     }

//     if (results.length === 0) {
//       res.status(404).json({ error: "Receipt not found" });
//       return;
//     }

//     // Return receipt data for the specified ID
//     res.status(200).json(results[0]);
//   });
// });

// Handle DELETE requests to '/receipt/delete/:receiptId'
router.delete("/delete/:receiptId", (req, res) => {
  const receiptId = req.params.receiptId;

  const sql = `
        DELETE FROM th_receipt
        WHERE receipt_pk = ?`;

  conn.query(sql, [receiptId], (err, result) => {
    if (err) {
      console.error("Error deleting receipt:", err);
      res.status(500).json({ error: "Error deleting receipt" });
      return;
    }

    // Check if any rows were affected by the delete operation
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Receipt not found" });
      return;
    }

    // Return success message
    res.status(200).json({ message: "Receipt deleted successfully" });
  });
});

router.post("/updateReceiptData/:receiptId", (req, res) => {
  const receiptId = req.params.receiptId;
  const updatedData = req.body; // Updated receipt data sent in the request body

  // Update the data in the database based on receipt ID
  const sql = "UPDATE your_table_name SET ? WHERE receipt_pk = ?"; // Change your_table_name to your actual table name
  conn.query(sql, [updatedData, receiptId], (err, result) => {
    if (err) {
      console.error("Error updating receipt data:", err);
      res.status(500).json({ error: "Error updating data" });
      return;
    }

    console.log("Receipt data updated successfully:", result);
    res.status(200).json({ message: "Receipt data updated successfully" });
  });
});

router.get("/view_sitebooking", (req, res) => {
  // const receiptNumber = req.query.receiptNumber;

  const sql = `select * from confirmation
  order by confirmation.id DESC`;

  conn.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching viewer receipt data:", err);
      res.status(500).json({ error: "Error fetching data" });
      return;
    }

    res.status(200).json(results);
  });
});

// router.get("/get_affidavit", (req, res) => {
//   const userId = req.query.user_id;

//   // Query your database to get the base64 PDF from the `th_user` table
//   const query = `SELECT user_affidiafit FROM th_user WHERE user_pk = ?`;

//   conn.query(query, [userId], (err, result) => {
//     if (err || result.length === 0) {
//       return res.status(500).json({ error: "Error fetching affidavit" });
//     }

//     const affidavitBase64 = result[0].user_affidiafit;

//     // Convert base64 to binary data
//     const affidavitBuffer = Buffer.from(affidavitBase64, "base64");

//     // Set the headers and send the PDF as binary data
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", "inline; filename=affidavit.pdf");
//     res.send(affidavitBuffer);
//   });
// });

app.get("/receipt/get_affidavit", async (req, res) => {
  const userId = req.query.user_id;
  console.log("Received User ID:", userId); // Debugging

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const query = `SELECT user_affidiafit FROM th_user WHERE user_pk = ?`;
    const [rows] = await pool.execute(query, [userId]);

    if (rows.length === 0 || !rows[0].user_affidiafit) {
      console.log("Affidavit not found for User ID:", userId);
      return res.status(404).json({ error: "Affidavit not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.send(rows[0].user_affidiafit);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get('/view_sitebooking', (req, res) => {
// const receiptNumber = req.query.receiptNumber;

//         const sql = `
//         SELECT
//             CONCAT('Name: ', u.username, ', ', 'Email ID: ', u.user_email, ', ', 'Mobile_No: ' ,u.user_mobile) AS Member_Details,
//             CONCAT('Project_Name: ', p.pro_name, ', ', 'Seniority_id: ', u.senior_id) AS Project_Details,
//             CONCAT(r.receipt_no) AS \`Receipt No.\`,
//             CONCAT(r.payment_amnt) AS \`Total Amount\`
//         FROM
//             th_user AS u
//         JOIN
//             th_user_project AS up ON u.senior_id = up.user_seniority_id
//         JOIN
//             th_projects AS p ON up.user_project_pk = p.project_pk
//         JOIN
//             th_receipt AS r ON up.project_fk = r.user_project_fk
//       `;

//         conn.query(sql, (err, results) => {
//             if (err) {
//               console.error('Error fetching viewer receipt data:', err);
//               res.status(500).json({ error: 'Error fetching data' });
//               return;
//             }

//             res.status(200).json(results);
//           });
//         });

// router.get("/gen_conn", (req, res) => {
//   const { user_pk } = req.query;
//   const user_data_query = `SELECT * FROM confirmation WHERE id=${user_pk} `;
//   //    Execute the SQL query
//   conn.query(user_data_query, (err, result) => {
//     if (err) {
//       console.error("Error getting the data:", err);
//       res.status(500).json({ error: "Error getting the data" });
//     } else {
//       console.log("Data fetched successfully");
//       res.status(200).json({ message: "Data fetched successfully", result });
//       //   const membername = result[0].username;
//     }
//   });
// });

router.get("/gen_conn", (req, res) => {
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

router.get("/viewshare", (req, res) => {
  const qry = "Select * From th_user order by user_pk desc";
  conn.query(qry, (err, results) => {
    if (err) {
      console.error("Error fetching viewer receipt data:", err);
      res.status(500).json({ error: "Error fetching data" });
      return;
    }

    res.status(200).json(results);
  });
});

router.get("/gen_share", (req, res) => {
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

router.get("/viewReceipts", (req, res) => {
  const get_receipts = `SELECT receipt_no FROM th_receipt`;
  console.log("get_receipts", get_receipts);

  conn.query(get_receipts, (err, result) => {
    if (err) {
      console.error("Error getting the data", err);
      res.status(500).json({ error: "Error getting the data" });
    } else {
      console.log("Data fetched successfully");
      // Extract only receipt_no values into a flat array
      const receiptNumbers = result.map((row) => row.receipt_no);
      res
        .status(200)
        .json({ message: "Data fetched successfully", receiptNumbers });
    }
  });
});

module.exports = router;
