const express = require('express');
const router = express.Router();
const conn = require('../config/config');


// Route for displaying a message

// Route to handle form submission
// router.post('/submitForm', (req, res) => {
//     const {
//         seniorityID,
//         name,
//         mobileNumber,
//         email,
//         residenceAddress,
//         reason,
//         amount,

//     } = req.body;

//     // Step 1: Insert data into th_user table
//     const insertUserQuery = `
//         INSERT INTO th_user (username, senior_id, user_mobile, user_email, user_address)
//         VALUES (?, ?, ?, ?, ?)
//     `;
//     conn.query(insertUserQuery, [name, seniorityID, mobileNumber, email, residenceAddress], (err, result) => {
//         if (err) {
//             console.error('Error inserting into th_user:', err);
//             res.status(500).json({ error: 'Internal Server Error' });
//             return;
//         }

//         const userId = result.insertId; // Obtained user_pk

//         // Step 2: Insert data into th_user_extra_charges table
//         const insertChargesQuery = `
//             INSERT INTO th_user_extra_charges (user_fk, total_extra_amnt)
//             VALUES (?, ?)
//         `;
//         conn.query(insertChargesQuery, [userId, amount], (err, result) => {
//             if (err) {
//                 console.error('Error inserting into th_user_extra_charges:', err);
//                 res.status(500).json({ error: 'Internal Server Error' });
//                 return;
//             }

//             const userExtraFk = result.insertId; // Obtained user_extra_pk

//             // Step 3: Insert data into th_user_exchg_history table
//             const insertHistoryQuery = `
//                 INSERT INTO th_user_exchg_history (user_fk, user_extra_fk, reason)
//                 VALUES (?, ?, ?)
//             `;
//             conn.query(insertHistoryQuery, [userId, userExtraFk, reason], (err, result) => {
//                 if (err) {
//                     console.error('Error inserting into th_user_exchg_history:', err);
//                     res.status(500).json({ error: 'Internal Server Error' });
//                     return;
//                 }

//                 // Send success response
//                 res.status(200).json({ message: 'Form submitted successfully' });
//             });
//         });
//     });
// });


router.post('/submitForm', (req, res) => {
    const {
        seniorityID, // This is the senior_id
        name,
        mobileNumber,
        email,
        residenceAddress,
        reason,
        totalExtraAmnt,
        chequeNo,
        paidDate
    } = req.body;

    const cur_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `SELECT user_pk FROM th_user WHERE senior_id = ?`;
    
    // Execute the SQL query
    conn.query(sql, [seniorityID], (err, rows) => {
        if (err) {
            console.error("Error fetching user data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        } 
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userPk = rows[0].user_pk;
        console.log("Successfully fetched userPk", userPk);

        const sql1 = `SELECT user_project_pk FROM th_user_project WHERE user_seniority_id = ?`;
        conn.query(sql1, [seniorityID], (err, result) => {
            if (err) {
                console.error("Error fetching user project data:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            } 
            
            if (result.length === 0) {
                return res.status(404).json({ error: "User project not found" });
            }

            const userprojectPk = result[0].user_project_pk;
            console.log("Successfully fetched userprojectPk", userprojectPk);

            const sql2 = `INSERT INTO th_user_extra_charges (user_fk, user_project_fk, user_seniority_id, total_extra_amnt) VALUES (?, ?, ?, ?)`;
            conn.query(sql2, [userPk, userprojectPk, seniorityID, totalExtraAmnt], (err, result) => {
                if (err) {
                    console.error("Error inserting data into th_user_extra_charges:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                const last_id = result.insertId;

                const sql3 = `INSERT INTO th_user_exchg_history (user_extra_fk, user_fk, cheque_no, cheque_amnt, reason, created_date, paid_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                conn.query(sql3, [last_id, userPk, chequeNo, totalExtraAmnt, reason, cur_date, paidDate], (err, result) => {
                    if (err) {
                        console.error("Error inserting data into th_user_exchg_history:", err);
                        return res.status(500).json({ error: "Internal Server Error" });
                    }

                    console.log("Data inserted successfully");
                    return res.status(200).json({ message: "Data submitted successfully" });
                });
            });
        });
    });
});

router.get('/viewextracharges', (req, res) => {
    // Construct the SQL query to fetch specific columns from th_user table
    const sql = `
    SELECT 
    th_user.username,
    th_user.senior_id,
    th_projects.pro_name,
    th_user_extra_charges.user_extra_pk,
    th_user_extra_charges.total_extra_amnt,
    th_user_extra_charges.paid_amount,
    th_user_extra_charges.pending_amount,
    th_user_exchg_history.paid_date,
    th_user_exchg_history.cheque_no,
    th_user_project.prop_dimension
FROM 
    th_user_extra_charges
LEFT JOIN 
    th_user ON th_user_extra_charges.user_fk = th_user.user_pk
LEFT JOIN 
    th_user_project ON th_user_extra_charges.user_project_fk = th_user_project.user_project_pk
LEFT JOIN 
    th_projects ON th_user_project.project_fk = th_projects.project_id
LEFT JOIN 
    th_user_exchg_history ON    th_user_extra_charges .user_extra_pk =  th_user_exchg_history .user_extra_fk
    
    order by th_user_extra_charges.user_extra_pk DESC`;
  
    // Execute the SQL query
    conn.query(sql, (err, rows) => {
        if (err) {
            console.error("Error fetching user data:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Send the fetched data as a JSON response
            res.status(200).json(rows);
        }
    });
  });

  router.get('/viewextrahistory/:userExtraPk', (req, res) => {
    // Extract userExtraPk from the request parameters
    // const userExtraPk = req.params.userExtraPk;
    const userExtraPk = req.params.userExtraPk;

    
    // Construct the SQL query to fetch user extra charges history
    const sql = `
    SELECT 
        ueh.cheque_no, 
        ueh.cheque_amnt, 
        ueh.extra_amnt, 
        ueh.reason, 
        ueh.created_date, 
        ueh.paid_date,
        ueh.user_extra_fk,
        CASE 
            WHEN ueh.ex_status = 1 THEN 'Paid'
            WHEN ueh.ex_status = 0 THEN 'Not Paid'
            ELSE 'Unknown'
        END AS payment_status,
        u.username
    FROM 
        th_user_exchg_history ueh
    JOIN 
    th_user_extra_charges uec ON ueh.user_extra_fk = uec.user_extra_pk
    JOIN 
        th_user u ON uec.user_fk = u.user_pk
    WHERE 
        uec.user_extra_pk = ?`;
  
    // Execute the SQL query with userExtraPk as parameter
    conn.query(sql, [userExtraPk], (err, rows) => {
        if (err) {
            console.error("Error fetching user extra charges history:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Send the fetched data as a JSON response
            res.status(200).json(rows);
        }
    });
});

router.put('/updatePaymentStatus/:userExtraPk', (req, res) => {
    const userExtraPk = req.params.userExtraPk;

    // Perform the necessary database update to change payment status from 0 to 1
    // This could be a SQL update query, assuming your database schema and connection are properly set up
    const sql = `
        UPDATE th_user_exchg_history
        SET ex_status = 1
        WHERE user_extra_fk = ?
    `;
    
    conn.query(sql, [userExtraPk], (err, result) => {
        if (err) {
            console.error("Error updating payment status:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Send a success response indicating that the payment status was updated
            res.status(200).json({ message: "Payment status updated successfully" });
        }
    });
});



 module.exports = router;