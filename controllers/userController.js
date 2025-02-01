const nodemailer = require("nodemailer");
const conn = require("../config/config.js");
const util = require("util");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "info@defencehousingsociety.com",
    pass: "qxan vqtg oojw pipd",
  },
});

const Nodemailer = async (req, res) => {
  const { username, email, seniorityId, Password } = req.body;
  console.log(req.body, "user password and details");
  try {
    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Member Login Credentials",
      html: `
   <div style="margin:auto; width:53%; border: 3px solid #244f9b;  font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    <div style=" justify-content:center; width:full; height:60px; background-color:#244f9b;"></div>
     <div style="padding:22px;">
        <p>Dear <span style="font-weight:bold">${username}</span>,</p>
      <p>From,<br/>Defence Habitat Housing Co-operative Society Ltd.</p>
      <div style="margin-top: 10px; margin-bottom: 10px;">
        <div style="width:120px; display:inline-block; padding:5px; background-color:#777777; color:#fff; font-weight:bold; text-align:center;">Member ID</div>
        <div style="width:277px; display:inline-block; padding:5px; background-color:#f9f9f9; border:1px solid #777777; ">${seniorityId}</div>
      </div>
      <div style="margin-top: 10px; margin-bottom: 10px;">
        <div style="width:120px; display:inline-block; padding:5px; background-color:#777777; color:#fff; font-weight:bold; text-align:center;">Email</div>
        <div style="width:277px; display:inline-block; padding:5px; background-color:#f9f9f9; border:1px solid #777777;">
          <a href="mailto:${email}" style="color:#244f9b; text-decoration:none;">${email}</a>
        </div>
      </div>
      <div style="margin-top: 10px; margin-bottom: 10px;">
        <div style="width:120px; display:inline-block; padding:5px; background-color:#777777; color:#fff; font-weight:bold; text-align:center;">Password</div>
        <div style="width:277px; display:inline-block; padding:5px; background-color:#f9f9f9; border:1px solid #777777;">${Password}</div>
      </div>
      <p>Click <a href="https://defencehousingsociety.com/memberlogin" style="color:#244f9b; text-decoration:none;">here</a> to login hhttps://defencehousingsociety.com/memberlogin</p>
      <p style="font-weight:bold; font-size:17px;">THANK YOU</p>
      <p style="font-weight:bold; color:black;">For further details, contact</p>
      <p>Behind Swathi Garden Hotel<br/>
      E Block, Sahakarnagar,<br/>
      Bengaluru - 560 092. Ph: 080 - 29903931</p>
     </div>
    </div>
`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email." });
  }
};
const editViewUser = async (req, res) => {
  console.log(req.query, "Query Parameters");
  const { user_pk, user_project_pk } = req.query;

  if (!user_pk || !user_project_pk) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  const disableOnlyFullGroupBy = `
    SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''))
  `;

  const sql = `
    SELECT 
      th_user.*,
      th_user_project.*,
      th_projects.*,
      SUM(th_receipt.payment_amnt) - 2500 AS paid_amount,
      CASE 
        WHEN th_user.user_status = 0 THEN 'Active'
        ELSE 'Inactive'
      END AS status
    FROM 
      th_user
    JOIN 
      th_user_project 
      ON th_user_project.user_fk = th_user.user_pk
    JOIN 
      th_projects 
      ON th_projects.project_id = th_user_project.project_fk
    LEFT JOIN 
      th_receipt 
      ON th_receipt.user_fk = th_user.member_pid
    WHERE 
      th_user.user_pk = ?
      AND th_user_project.user_project_pk = ?
    GROUP BY 
      th_user.user_pk, 
      th_user_project.user_fk, 
      th_projects.project_id
    ORDER BY 
      th_user.user_pk DESC
  `;

  try {
    // Disable ONLY_FULL_GROUP_BY for this session
    await new Promise((resolve, reject) => {
      conn.query(disableOnlyFullGroupBy, (err) => {
        if (err) {
          console.error("Error disabling ONLY_FULL_GROUP_BY:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Execute the SQL query
    conn.query(sql, [user_pk, user_project_pk], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "No data found for the provided IDs" });
      }

      console.log(results, "Fetched User Data for Editing");
      // res.render("editviewUser", {
      //   response: response,
      //   user: user,
      //   user_pk,
      // });
      res.render("editviewUser", {
        response: results[0],
      });
      // res.status(200).json(results[0]); // Send the first result
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).json({ error: "Inn ternal Server Error" });
  }
};

const saveEditUser = async (req, res) => {
  console.log(req.body, "incoming data");

  try {
    const {
      refname,
      senior_id,
      emailInput,
      phoneInput,
      projectDropdown,
      plotDimensionDropdown,
      user_pk,
      dateofbirth,
      property_price, // Include property_price from the request body
    } = req.body;

    const query = util.promisify(conn.query).bind(conn);

    // Update user details in the `th_user` table
    const updateUserQuery = `
      UPDATE th_user 
      SET username = ?, senior_id = ?, user_email = ?, user_mobile = ?, user_date_birth = ?
      WHERE user_pk = ? 
    `;
    await query(updateUserQuery, [
      refname,
      senior_id,
      emailInput,
      phoneInput,
      dateofbirth,
      user_pk,
    ]);

    // Update project details in the `th_user_project` table, including property_price
    const updateProjectQuery = `
      UPDATE th_user_project 
      SET project_fk = ?, prop_dimension = ?, property_price = ? 
      WHERE user_fk = ?
    `;
    await query(updateProjectQuery, [
      projectDropdown,
      plotDimensionDropdown,
      property_price, // Add property_price to the query parameters
      user_pk,
    ]);

    res.status(200).json({ message: "User Editted Successfully" });
  } catch (error) {
    console.error("Error updating user or project data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating user or project data" });
  }
};

// const saveEditUser = async (req, res) => {
//   console.log(req.body,'incoming data');

//   try {
//     const {
//       refname,
//       senior_id,
//       emailInput,
//       phoneInput,
//       projectDropdown,
//       plotDimensionDropdown,
//       user_pk,
//       dateofbirth,
//       property_price
//     } = req.body;
//     const query = util.promisify(conn.query).bind(conn);
//     const updateUserQuery = `
//      UPDATE th_user
//      SET username = ?, senior_id = ?, user_email = ?, user_mobile = ? ,user_date_birth = ?
//      WHERE user_pk = ? `;
//     await query(updateUserQuery, [
//       refname,
//       senior_id,
//       emailInput,
//       phoneInput,
//       dateofbirth,
//       user_pk,
//     ]);
//     const updateProjectQuery = `
//       UPDATE th_user_project
//       SET project_fk = ?, prop_dimension = ?
//       WHERE user_fk = ?
//       `;
//     await query(updateProjectQuery, [
//       projectDropdown,
//       plotDimensionDropdown,
//       user_pk,
//     ]);
//     res.status(200).json({ message: "User Editted Successfully" });
//   } catch (error) {
//     console.error("Error updating user or project data:", error);
//     res.status(500).json({ error: "An error occurred while updating user or project data" });
//   }
// };

const deletViewplotcancel = (req, res) => {
  const { userId } = req.body;
  // const sql = `DELETE FROM th_user WHERE user_status = 1 AND user_pk = ?`;
  const sql = `UPDATE th_user SET user_status = 0 WHERE user_status = 1 AND user_pk = ?`;
  conn.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete user" });
    }
    console.log(result, "deleted");

    res.status(200).json({ message: "User deleted successfully", result });
  });
};

const editProjectStatus = (req, res) => {
  try {
    console.log(req.params, "function called");
    const { id } = req.params; // Extract the id (pro_status_pk) from the request params
    console.log(id, "passed id");
    const sql = `
      SELECT 
        ps.pro_status_pk,
        p.pro_name AS 'Project Name',
        ps.title AS 'Title',
        ps.desc AS 'Description', 
        ps.file AS 'File',
        ps.status_add_date AS 'Status_Date',
        ps.notification_via AS 'Notification'
      FROM 
        th_project_status ps
      INNER JOIN 
        th_projects p ON ps.project_fk = p.project_pk
      WHERE 
        ps.pro_status_pk = ?;
    `;
    // Query the database to fetch project status data by pro_status_pk
    conn.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error fetching project status for editing:", err);
        res.status(500).json({ error: "Error fetching data" });
        return;
      }
      if (result.length === 0) {
        res
          .status(404)
          .json({ message: "No project status found for this ID" });
        return;
      }
      // Render the EditProjectStatus view, passing the project status data
      console.log(result[0], "resultssssssssssssssssssssssss");
      res.render("EditProjectStatus", { projectStatus: result[0] });
    });
  } catch (error) {
    console.error("Error in editProjectStatus function:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const editProjectSave = (req, res) => {
  const {
    projectDropdown,
    statusDate,
    statusTitle,
    statusDetails,
    notifications,
    pro_status_pk,
  } = req.body;

  const notification_via = Array.isArray(notifications)
    ? notifications.join(", ")
    : notifications;

  // If statusDate is empty, set it to the current date
  const status_add_date = statusDate
    ? statusDate
    : new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  let sql =
    "UPDATE th_project_status SET title = ?, `desc` = ?, status_add_date = ?, notification_via = ?";
  const values = [
    statusTitle,
    statusDetails,
    status_add_date,
    notification_via,
  ];

  if (req.file) {
    sql += ", file = ?";
    values.push(req.file.path);
  }

  sql += " WHERE pro_status_pk = ?";
  values.push(pro_status_pk);

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating data in MySQL:", err);
      res
        .status(500)
        .json({ status: 500, error: "Error updating data in the database" });
      return;
    }

    if (result.affectedRows === 0) {
      console.error("No matching record found to update");
      res
        .status(404)
        .json({ status: 404, message: "No matching record found to update" });
      return;
    }

    console.log("Data updated in MySQL successfully");
    res.status(200).json({
      status: 200,
      message: "Data updated in the database successfully",
    });
  });
};

const editAddExtraCharges = (req, res) => {
  console.log(req.params, "datasssss");
  const { id } = req.params;
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
    th_user_exchg_history ON th_user_extra_charges.user_extra_pk = th_user_exchg_history.user_extra_fk
  WHERE 
    th_user.senior_id = ?
  ORDER BY  
    th_user_extra_charges.user_extra_pk DESC
`;

  // Execute the SQL query with the provided ID
  conn.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error fetching user data:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // Send the fetched data as a JSON response
      // res.status(200).json(rows);
      res.render("editExtraChargesForm", { rows });
      console.log(rows, "fetched datassss");

      // console.log(rows, 'fetched datas');
    }
  });
};

const saveEditAddExtraCharges = (req, res) => {
  const {
    user_pk,
    name,
    senior_id,
    projectDropdown,
    plotDimensionDropdown,
    paid_date,
    total_extra_amnt,
    cheque_no,
  } = req.body;
  console.log("Values to be updated:", {
    user_pk,
    name,
    senior_id,
    projectDropdown,
    plotDimensionDropdown,
    paid_date,
    total_extra_amnt,
    cheque_no,
  });
  const sql = `
    UPDATE th_user_extra_charges 
    JOIN th_user_exchg_history ON th_user_extra_charges.user_extra_pk = th_user_exchg_history.user_extra_fk
    JOIN th_user ON th_user_extra_charges.user_fk = th_user.user_pk
    JOIN th_user_project ON th_user_extra_charges.user_project_fk = th_user_project.user_project_pk
    SET
        th_user.username = ?,
        th_user.senior_id = ?,
        th_user_project.prop_dimension = ?,
        th_user_project.project_fk = ?,
        th_user_extra_charges.total_extra_amnt = ?,
        th_user_exchg_history.paid_date = ?,
        th_user_exchg_history.cheque_no = ?
    WHERE th_user_extra_charges.user_extra_pk = ?
  `;
  console.log("SQL Query:", sql);
  conn.query(
    sql,
    [
      name,
      senior_id,
      plotDimensionDropdown,
      projectDropdown,
      total_extra_amnt,
      paid_date,
      cheque_no,
      user_pk,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating extra charge details:", err);
        return res
          .status(500)
          .json({ message: "Error updating user extra charges" });
      }
      console.log("SQL Result:", result);
      if (result.affectedRows > 0) {
        console.log("User details updated successfully.");
        return res.status(200).json({ message: "User Editted Successfully" });
      } else {
        console.log("User not found or no changes made.");
        return res
          .status(404)
          .json({ message: "User not found or no changes made" });
      }
    }
  );
};

const editReciept = (req, res) => {
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
      th_receipt.dimension AS 'Dimension',
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
          th_user_project ON th_receipt.user_project_fk = th_user_project.project_fk
      LEFT JOIN
          th_projects ON th_user_project.project_fk = th_projects.project_id
      LEFT JOIN
          th_user ON th_receipt.user_fk = th_user.member_pid
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
    res.render("editreceipt", { result: results[0], receiptId });
    console.log(results[0]);

    // res.status(200).json(results[0]);
  });
};

const saveEditReciept = (req, res) => {
  try {
    console.log("incoming data:", req.body);
    const {
      recno,
      date,
      name,
      cAddress,
      paymentTypeDropdown,
      paymentModeDropdown,
      bankNameInput,
      branchNameInput,
      amount,
      paymentDate,
      dynamicInput,
      share,
      membership,
      admission,
      sharefee,
      miscellaneous,
      dimension,
      siteamount,
      advanceamount,
      installment,
      installmentamount,
      reciptId,
    } = req.body;

    // Check for valid data types (Optional: add more validations based on your schema)
    if (!recno || !reciptId || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid data input" });
    }

    const updateReceiptSql = `
        UPDATE th_receipt
        SET
          receipt_no = ?,
          created_date = ?,
          payment_mode = ?,
          bank_name = ?,
          branch = ?,
          payment_amnt = ?,
          cheque_dd_transaction_id = ?,
          share_fee = ?,
          member_fee = ?,
          admission_fee = ?,
          miscellaneous = ?,
          payment_type = ?,
          cr_installment = ?,
          raddress = ?,
          dimension= ?
        WHERE receipt_pk = ?`;

    const updateValues = [
      recno || null,
      date || null,
      paymentModeDropdown || null,
      bankNameInput || null,
      branchNameInput || null,
      amount || 0,
      dynamicInput || null,
      sharefee || null,
      membership || null,
      admission || null,
      miscellaneous || null,
      paymentTypeDropdown || null,
      installment || null,
      cAddress || null,
      dimension || null,
      reciptId,
    ];
    conn.query(updateReceiptSql, updateValues, (err, result) => {
      if (err) {
        console.error("Error updating receipt:", err);
        return res.status(500).json({ error: "Error updating receipt" });
      }
      console.log("Receipt updated successfully:", result);
      res.status(200).json({ message: "Receipt updated successfully" });
    });
  } catch (error) {
    console.log("Error in saveEditReciept:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the receipt" });
  }
};

const editviewsitebooking = (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM confirmation WHERE id = ? ORDER BY id DESC`;
    conn.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error fetching confirmation data:", err);
        res.status(500).json({ error: "Error fetching data" });
        return;
      }
      console.log(results, "resultesssssssssssssssssssssss");
      res.render("editViewsiteBooking", { result: results[0] });
    });
  } catch (error) {
    console.error("Error in editviewsitebooking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const saveEditSiteBooking = (req, res) => {
//   try {
//     console.log(req.body, 'Incoming data');
//     const {
//       membername,
//       projectaddress,
//       issuedate,
//       amount,
//       paymentmethod,
//       recno,
//       sid,
//       booking_id
//     } = req.body;

//     const query = `
//       UPDATE confirmation
//       SET
//         name1 = ?,         -- 'membername' maps to 'name1'
//         name3 = ?,         -- 'projectaddress' maps to 'name3'
//         issuedate = ?,     -- 'issuedate' maps to 'issuedate'
//         name8 = ?,         -- 'amount' maps to 'name8'
//         name9 = ?,         -- 'paymentmethod' maps to 'name9'
//         name14 = ?,        -- 'recno' maps to 'name14'
//         name16 = ?         -- 'sid' maps to 'name16'
//       WHERE id = ?
//     `;

//     // Execute the query with the correct values
//     conn.query(
//       query,
//       [membername, projectaddress, issuedate, amount, paymentmethod, recno, sid, booking_id],
//       (err, result) => {
//         if (err) {
//           console.error('Error while updating site booking', err);
//           return res.status(500).json({ error: 'Database update error' });
//         }

//         if (result.affectedRows === 0) {
//           return res.status(404).json({ error: 'Booking not found' });
//         }
//         // Successfully updated
//         res.status(200).json({ message: 'Booking updated successfully' });
//       }
//     );

//   } catch (error) {
//     console.log(error, 'Error in saveEditSiteBooking');
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const saveEditSiteBooking = (req, res) => {
  try {
    console.log(req.body, "Incoming data");
    const {
      membername,
      address,
      projectname,
      propertysize,
      persqft,
      projectaddress,
      issuedate,
      amount,
      paymentmethod,
      refno,
      bank,
      branch,
      sitedimension,
      recno,
      memberid,
      sid,
      comformation_no,
      duration,
      booking_id,
    } = req.body;

    const query = `
      UPDATE confirmation
      SET
        name1 = ?,
        name2 = ?,         
        name3 = ?,
        name4 = ?, 
        name5 = ?, 
        name6 = ?,  
              
        name8 = ?,        
        name9 = ?, 
        name10 = ?,      
        name11 = ?,      
        name12 = ?,      
        name13 = ?,      
        name14 = ?, 
        name15 = ?,      
        name16 = ?,
        name17 = ?,
        site_fk = ?,
        issuedate = ?
        WHERE id = ?
    `;

    // Execute the query with the correct values
    conn.query(
      query,
      [
        membername,
        address,
        projectname,
        propertysize,
        persqft,
        projectaddress,
        amount,
        paymentmethod,
        refno,
        bank,
        branch,
        sitedimension,
        recno,
        memberid,
        sid,
        comformation_no,
        duration,
        issuedate,

        booking_id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error while updating site booking", err);
          return res.status(500).json({ error: "Database update error" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Booking not found" });
        }
        // Successfully updated
        res.status(200).json({ message: "Booking updated successfully" });
      }
    );
  } catch (error) {
    console.log(error, "Error in saveEditSiteBooking");
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  Nodemailer,
  editViewUser,
  saveEditUser,
  deletViewplotcancel,
  editProjectStatus,
  editProjectSave,
  editAddExtraCharges,
  saveEditAddExtraCharges,
  editReciept,
  saveEditReciept,
  editviewsitebooking,
  saveEditSiteBooking,
};
