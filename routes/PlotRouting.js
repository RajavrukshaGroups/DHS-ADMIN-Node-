const express = require('express');
const router = express.Router();
const conn = require('../config/config');

router.get('/viewtransferdata',(req,res)=>{
    const sql =`SELECT *
    FROM th_project_transfer
    JOIN th_projects ON th_project_transfer.project_fk = th_projects.project_id
    WHERE th_project_transfer.user_fk_from != 0 AND th_project_transfer.user_fk_to != 0
    ORDER BY th_project_transfer.project_trans_pk DESC`

    conn.query(sql, (err, rows) => {
        if (err) {
            console.error("Error fetching user data:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Send the fetched data as a JSON response
            res.status(200).json(rows);
        }
    });
})


router.get('/viewcanceldata',(req,res)=>{
    const sql =`select * from th_user where user_status=1 order by user_pk asc`

    conn.query(sql, (err, rows) => {
        if (err) {
            console.error("Error fetching user data:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Send the fetched data as a JSON response
            res.status(200).json(rows);
        }
    });
})



router.post('/getdata', (req, res) => {
    const { seniorityId } = req.body;
    const qry = 'SELECT * FROM th_user WHERE senior_id = ?';
    
    conn.query(qry, [seniorityId], (err, rows) => {
      if (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (rows.length > 0) {
          res.status(200).json(rows); // Send the first matching row as JSON
        } else {
          res.status(404).json({ error: 'No data found for the given seniority ID' });
        }
      }
    });
  });

router.get('/sen_id',(req,res)=>{
   
    const sql = `SELECT user_seniority_id FROM th_user_project ORDER BY user_seniority_id ASC`

    conn.query(sql, (err, rows) => {
        if (err) {
            console.error("Error fetching user data:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Send the fetched data as a JSON response
            res.status(200).json(rows);
            
        }
    });
})






router.post('/getmemdata',(req,res)=>{
    const { seniorityId } = req.body;
    const sql = `SELECT *,
    CONCAT(e.plotsize_width, 'X', e.plotsize_height) AS plotsize_dimensions
FROM th_user_project AS a
JOIN th_projects AS b ON a.project_fk = b.project_id
JOIN th_user AS c ON a.user_fk = c.user_pk
JOIN th_project_land AS d on a.project_land_fk = d.pro_land_pk
JOIN th_plotsize AS e ON d.plotsize_fk = e.plotsize_pk
WHERE a.user_seniority_id = ?
    ` 
    conn.query(sql,[seniorityId], (err, rows) => {
        if (err) {
            console.error("Error fetching user data:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Send the fetched data as a JSON response
            res.status(200).json(rows);
        }
    });
})


router.post('/adddata', (req, res) => {
    const {
        seniorityIdValue,
        nameFromValue,
        emailFromValue,
        projectLoadFromValue,
        projectFromValue,
        propertySizeFromValue,
        memberNameToValue,
        transferDateValue,
        mobileNumberToValue,
        emailToValue,
        addressToValue,
        reasonValue,
        user_pwd,
        member_PId,
        cancel_pk
    } = req.body;

    const cur_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const user_values = [
        memberNameToValue,
        mobileNumberToValue,
        mobileNumberToValue,
        emailToValue,
        user_pwd,
        addressToValue,
        cur_date,
        member_PId
    ];

    const insert_query = `
        INSERT INTO th_user (
            username,
            user_mobile,
            mobile2,
            user_email,
            user_epwd,
            user_address,
            created_date,
            member_pid
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conn.query(insert_query, user_values, (err, result) => {
        if (err) {
            console.error("Error inserting into user table:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        console.log("Data inserted into user table successfully");
        const lastInsertedUserPk = result.insertId;

        const trans_value = [
            cancel_pk,
            nameFromValue,
            projectFromValue,
            seniorityIdValue,
            lastInsertedUserPk,
            memberNameToValue,
            reasonValue,
            cur_date,
            transferDateValue
        ];

        const proj_trans = `
            INSERT INTO th_project_transfer (
                user_fk_from,
                username_from,
                project_fk,
                seniority_id,
                user_fk_to,
                username_to,
                reason,
                created_date,
                transferdate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conn.query(proj_trans, trans_value, (err, result) => {
            if (err) {
                console.error("Error inserting into th_project_transfer :", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            console.log("Data inserted into th_project_transfer successfully");
            const lastInsertedprojpk = result.insertId;

            const category = "User";
            const sub_category = "Plot Transferred";
            const fm_n = `From Name: ${nameFromValue}`;
            const to_n = `To Name: ${memberNameToValue}`;
            const descript = fm_n +"\n"+to_n;
            const log_values = [
                category,
                sub_category,
                cancel_pk,
                nameFromValue,
                seniorityIdValue,
                projectLoadFromValue,
                descript,
                cur_date
            ];

            const log_report = `
                INSERT INTO th_logged_report (
                    category,
                    sub_category,
                    user_fk,
                    user_name,
                    user_seniority_id,
                    project_name,
                    description,
                    created_dtm
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            conn.query(log_report, log_values, (err, result) => {
                if (err) {
                    console.error("Error inserting into th_logged_report :", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                console.log("Data inserted into th_logged_report successfully");
                const lastInserted = result.insertId;
                res.status(200).json({ message: "Data inserted successfully", lastInserted });
            });
        });
    });
});


router.post('/addcanceldata', (req, res) => {
    const {
        seniorityIdValue,
        nameFromValue,
        emailFromValue,
        mobileNumberValue,
        projectLoadFromValue,
        propertySizeFromValue,
        doc,
        reasonValue,
        cancel_pk,
        cancel_pro_pk,
        cancel_mid,
        c_pid,
        p_land_fk,
        p_price
    } = req.body;

    const values = [
        seniorityIdValue,
        nameFromValue,
        emailFromValue,
        mobileNumberValue,
        projectLoadFromValue,
        propertySizeFromValue,
        doc,
        reasonValue,
        cancel_pk,
        cancel_pro_pk,
        cancel_mid,
        c_pid,
        p_land_fk,
        p_price
    ];

    console.log(values);

    const cur_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const user_update = `UPDATE th_user SET user_status = 1 WHERE user_pk = ${cancel_pk}`;
    conn.query(user_update, (err, result) => {
        if (err) {
            console.error("Error updating th_user table:", err);
            return res.status(500).json({ error: "Error updating th_user table." });
        } else {
            console.log("Data updated in th_user successfully");
            const category = "User";
            const sub_category = "Plot Cancelled";
            const descript = "";
            const log_report = `INSERT INTO th_logged_report (category, sub_category, user_fk, user_name, user_seniority_id, project_name, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const lg_values = [
                category,
                sub_category,
                cancel_pk,
                nameFromValue,
                seniorityIdValue,
                projectLoadFromValue,
                descript,
                cur_date
            ];
            conn.query(log_report, lg_values, (err, result) => {
                if (err) {
                    console.error("Error updating th_logged_report table:", err);
                    return res.status(500).json({ error: "Error updating th_logged_report table." });
                }
                console.log("Data updated in log successfully");
                res.status(200).json({ message: "Plot Cancellation Form Submitted Successfully!" });
            });
        }
    });
});



module.exports = router;