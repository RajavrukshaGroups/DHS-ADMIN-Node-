const express = require("express");
const router = express.Router();
const conn = require("../config/config");
const session = require("express-session");
const moment = require("moment-timezone");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const bcrypt = require("bcrypt");
const { route } = require("./UserRouting");
router.use(
  session({
    secret: "your_secret_key",
    // secret: 'i9v0HvxFgUxNz4g24nApRkRr48CwZa89',
    // Replace with your actual secret key
    resave: false,
    saveUninitialized: true,
  })
);

function generateRandomString(n) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * characters.length);
    randomString += characters[index];
  }
  return randomString;
}

function generatePwd(length) {
  const chars = "abcdefghijklmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars.charAt(randomIndex);
  }
  return password;
}

// userRouting.js

// router.post("/insertdata", (req, res) => {
//   const {
//     refname,
//     refdesignation,
//     refidNo,
//     relationship,
//     projectDropdown,
//     pro_name,
//     plotDimensionDropdown,
//     PlotsizePk,
//     total_property_size,
//     perSqftPrice,
//     selectedPropertyCost,
//     percentageCost,
//     salutationDropdown,
//     name,
//     mobileNumber,
//     altMobileNumber,
//     email,
//     dob,
//     fatherHusbandName,
//     residenceAddress,
//     correspondenceAddress,
//     workingAddress,
//     memberPhotoBase64,
//     memberSignBase64,
//     nomineename,
//     nomineeage,
//     nomineeRelationship,
//     nomineeaddress,
//     seniorityID,
//     membershipNo,
//     confirmationNo,
//     shareCertificateNo,
//     receiptNo,
//     recpdate,
//     noOfShares,
//     shareFee,
//     membershipFee,
//     applicationFee,
//     admissionFee,
//     miscExpenses,
//     paymentDetails,
//   } = req.body;
//   const grand_id = generateRandomString(6);
//   const member_PId = generateRandomString(6);
//   const membership_id = generateRandomString(6);
//   const paymentId = generateRandomString(6);
//   const user_epwd = generatePwd(8);
//   const user_status = 0;

//   const values = [
//     refname,
//     refdesignation,
//     refidNo,
//     relationship,
//     projectDropdown,
//     pro_name,
//     plotDimensionDropdown,
//     PlotsizePk,
//     total_property_size,
//     perSqftPrice,
//     selectedPropertyCost,
//     percentageCost,
//     salutationDropdown,
//     name,
//     mobileNumber,
//     altMobileNumber,
//     email,
//     dob,
//     fatherHusbandName,
//     residenceAddress,
//     correspondenceAddress,
//     workingAddress,
//     memberPhotoBase64,
//     memberSignBase64,
//     nomineename,
//     nomineeage,
//     nomineeRelationship,
//     nomineeaddress,
//     seniorityID,
//     membershipNo,
//     confirmationNo,
//     shareCertificateNo,
//     receiptNo,
//     recpdate,
//     noOfShares,
//     shareFee,
//     membershipFee,
//     applicationFee,
//     admissionFee,
//     miscExpenses,
//     paymentDetails,
//     (paymentTypeDropdown = paymentDetails[0].paymentTypeDropdown),
//     (dynamicLabel = paymentDetails[0].dynamicLabel),
//     (paymentModeDropdown = paymentDetails[0].paymentModeDropdown),
//     (bankNameInput = paymentDetails[0].bankNameInput),
//     (branchNameInput = paymentDetails[0].branchNameInput),
//     (amount = paymentDetails[0].amount),
//     (paymentDate = paymentDetails[0].paymentDate),
//     (dynamicLabel = paymentDetails[0].dynamicLabel),
//     (installmentsDropdown = paymentDetails[0].installmentsDropdown),
//     grand_id,
//     member_PId,
//     membership_id,
//     paymentId,
//     user_epwd,
//   ];

//   const currentDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Get current date
//   console.log("This is rec date !!!!!: ",recpdate)

//   // Insert into th_user table
//   const user_data_insert = `INSERT INTO th_user (
//     username, user_mobile, mobile2, user_email, user_epwd, user_address, address2,
//     user_date_birth, father_r_husband, company_address, user_photo, photo_user_sign,
//     mem_payment, mem_amnt, member_bank, membership_det_no, share_cert_no,
//     comformation_no, mr_mrs_ms, user_status, created_date, reference_name_,
//     reference_designation, ref_service_id_no, ref_relationship_with_applicant, member_pid,senior_id
//   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   const user_values = [
//     name,
//     mobileNumber,
//     altMobileNumber,
//     email,
//     user_epwd,
//     residenceAddress,
//     correspondenceAddress,
//     dob,
//     fatherHusbandName,
//     workingAddress,
//     memberPhotoBase64,
//     memberSignBase64,
//     paymentTypeDropdown,
//     amount,

//     bankNameInput,
//     membershipNo,
//     shareCertificateNo,
//     confirmationNo,
//     salutationDropdown,
//     user_status,
//     currentDate,
//     refname,
//     refdesignation,
//     refidNo,
//     relationship,
//     member_PId,
//     seniorityID,
//   ];

//   conn.query(user_data_insert, user_values, (err, result) => {
//     if (err) {
//       console.error("Error inserting user data:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       console.log("Data inserted into user table successfully");
//       const lastInsertedUserPk = result.insertId;
//       console.log("this is plotsizefk : ", PlotsizePk);
//       const pro_pk = `SELECT pro_land_pk FROM th_project_land where plotsize_fk =?`;

//       conn.query(pro_pk, PlotsizePk, (err, result) => {
//         if (err) {
//           console.error("Error fetching pro_pk:", err);
//         } else {
//           console.log("fetched successfully");

//           const pro_land_pk = result[0].pro_land_pk;

//           // Insert into th_user_project table
//           const user_pro_qry = `INSERT INTO th_user_project (
//         user_seniority_id, project_fk, project_land_fk, property_price, nominess_name,
//         nominess_relationship, nominess_age, nominess_addr, user_fk, created_date,
//         prop_dimension, project_size, sqft_rate, property_mid
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//           const user_pro_values = [
//             seniorityID,
//             projectDropdown,
//             pro_land_pk,
//             selectedPropertyCost,
//             nomineename,
//             nomineeRelationship,
//             nomineeage,
//             nomineeaddress,
//             lastInsertedUserPk,
//             currentDate,
//             plotDimensionDropdown,
//             total_property_size,
//             perSqftPrice,
//             member_PId,
//           ];
//           conn.query(user_pro_qry, user_pro_values, (err, res) => {
//             if (err) {
//               console.error("Error inserting user project data:", err);
//             } else {
//               console.log("Data inserted into user_project table successfully");
//               const lastInsertedproPk = res.insertId;

//               // Insert into th_receipt table
//               // Insert into th_receipt table
//               const rec_qury = `INSERT INTO th_receipt (
//             receipt_no, receipt_date, user_fk, user_project_fk, payment_mode, payment_amnt,
//             cheque_no, transaction_id, dd_no, branch, bank_name, share, member_fee,
//             admission_fee, share_fee, application_fee, miscellaneous,created_date,
//             adv_amnt1, cr_installment, rname, raddress ,cheque_dd_transaction_id ,payment_type
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`;

//               const rec_qury_values = [
//                 receiptNo,
//                 recpdate,
//                 member_PId,
//                 projectDropdown,
//                 paymentModeDropdown,
//                 amount,
//                 dynamicLabel,
//                 dynamicLabel,
//                 dynamicLabel,
//                 branchNameInput,
//                 bankNameInput,
//                 noOfShares,
//                 membershipFee,
//                 admissionFee,
//                 shareFee,
//                 applicationFee,
//                 miscExpenses,
//                 recpdate,
//                 paymentTypeDropdown,
//                 "0",
//                 name,
//                 residenceAddress,
//                 dynamicLabel,
//                 paymentTypeDropdown
//               ];

//               console.log("This is rec data --- ",rec_qury_values)

//               conn.query(rec_qury, rec_qury_values, (err, rows) => {
//                 if (err) {
//                   console.error("Error inserting receipt data:", err);
//                 } else {
//                   console.log(
//                     "Data inserted into th_receipt table successfully"
//                   );
//                   const lastInsertedrecPk = rows.insertId;

//                   // Insert into th_user_history_amnt table
//                   const user_history_amnt_qry = `INSERT INTO th_user_history_amnt (
//                 payment_type, adv_r_installm, history_amnt, payment, cheque_no, bank_name,
//                 branch, transaction_id, dd_no, user_fk, user_project_fk,
//                 project_fk, receipt_fk
//               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//                   const user_history_amnt_qry_values = [
//                     paymentTypeDropdown,
//                     amount,
//                     paymentModeDropdown,
//                     dynamicLabel,
//                     bankNameInput,
//                     branchNameInput,
//                     dynamicLabel,
//                     dynamicLabel,
//                     dynamicLabel,
//                     lastInsertedUserPk,
//                     lastInsertedproPk,
//                     projectDropdown,
//                     lastInsertedrecPk,
//                   ];

//                   conn.query(
//                     user_history_amnt_qry,
//                     user_history_amnt_qry_values,
//                     (err, results) => {
//                       if (err) {
//                         console.error(
//                           "Error inserting user history amount data:",
//                           err
//                         );
//                       } else {
//                         console.log(
//                           "Data inserted into th_user_history_amnt table successfully"
//                         );
//                       }
//                     }
//                   );

//                   // Insert into th_logged_report table
//                   const log_report_user = `INSERT INTO th_logged_report (
//                 category, sub_category, user_fk, user_name, user_seniority_id, project_name,
//                 receipt_no, description, created_dtm
//               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//                   const log_report_user_values = [
//                     "User",
//                     "New user created",
//                     lastInsertedUserPk,
//                     name,
//                     seniorityID,
//                     pro_name,
//                     "",
//                     "",
//                     currentDate,
//                   ];

//                   const log_report_receipt = `INSERT INTO th_logged_report (
//                 category, sub_category, user_fk, user_name, user_seniority_id, project_name,
//                 receipt_no, description, created_dtm
//               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//                   const log_report_receipt_values = [
//                     "Receipt",
//                     "New receipt created",
//                     lastInsertedUserPk,
//                     name,
//                     seniorityID,
//                     pro_name,
//                     receiptNo,
//                     "",
//                     currentDate,
//                   ];

//                   conn.query(
//                     log_report_user,
//                     log_report_user_values,
//                     (err, results) => {
//                       if (err) {
//                         console.error(
//                           "Error inserting into log for user:",
//                           err
//                         );
//                       } else {
//                         console.log("New user log entry created");
//                       }
//                     }
//                   );

//                   conn.query(
//                     log_report_receipt,
//                     log_report_receipt_values,
//                     (err, results) => {
//                       if (err) {
//                         console.error(
//                           "Error inserting into log for receipt:",
//                           err
//                         );
//                       } else {
//                         console.log("New receipt log entry created");
//                       }
//                     }
//                   );

//                   // Continue with other queries and logic as needed...
//                 }
//               });
//             }
//           });
//         }
//       });

//       res.status(200).json({ status: 200, message: 'Data inserted into database successfully' });
//     }
//   });
// });

router.post("/insertdata", (req, res) => {
  const {
    refname,
    refdesignation,
    refidNo,
    relationship,
    projectDropdown,
    pro_name,
    plotDimensionDropdown,
    PlotsizePk,
    total_property_size,
    perSqftPrice,
    selectedPropertyCost,
    percentageCost,
    salutationDropdown,
    name,
    mobileNumber,
    altMobileNumber,
    email,
    dob,
    fatherHusbandName,
    residenceAddress,
    correspondenceAddress,
    workingAddress,
    memberPhotoBase64,
    memberSignBase64,
    nomineename,
    nomineeage,
    nomineeRelationship,
    nomineeaddress,
    seniorityID,
    membershipNo,
    confirmationNo,
    shareCertificateNo,
    receiptNo,
    recpdate,
    noOfShares,
    shareFee,
    membershipFee,
    applicationFee,
    admissionFee,
    miscExpenses,
    paymentDetails,
  } = req.body;

  const grand_id = generateRandomString(6);
  const member_PId = generateRandomString(6);
  const membership_id = generateRandomString(6);
  const paymentId = generateRandomString(6);
  const user_epwd = generatePwd(8);
  const user_status = 0;

  const values = [
    refname,
    refdesignation,
    refidNo,
    relationship,
    projectDropdown,
    pro_name,
    plotDimensionDropdown,
    PlotsizePk,
    total_property_size,
    perSqftPrice,
    selectedPropertyCost,
    percentageCost,
    salutationDropdown,
    name,
    mobileNumber,
    altMobileNumber,
    email,
    dob,
    fatherHusbandName,
    residenceAddress,
    correspondenceAddress,
    workingAddress,
    memberPhotoBase64,
    memberSignBase64,
    nomineename,
    nomineeage,
    nomineeRelationship,
    nomineeaddress,
    seniorityID,
    membershipNo,
    confirmationNo,
    shareCertificateNo,
    receiptNo,
    recpdate,
    noOfShares,
    shareFee,
    membershipFee,
    applicationFee,
    admissionFee,
    miscExpenses,
    paymentDetails,
    (paymentTypeDropdown = paymentDetails[0].paymentTypeDropdown),
    (dynamicLabel = paymentDetails[0].dynamicLabel),
    (paymentModeDropdown = paymentDetails[0].paymentModeDropdown),
    (bankNameInput = paymentDetails[0].bankNameInput),
    (branchNameInput = paymentDetails[0].branchNameInput),
    (amount = paymentDetails[0].amount),
    (paymentDate = paymentDetails[0].paymentDate),
    (dynamicLabel = paymentDetails[0].dynamicLabel),
    (installmentsDropdown = paymentDetails[0].installmentsDropdown),
    grand_id,
    member_PId,
    membership_id,
    paymentId,
    user_epwd,
  ];

  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  // Get current date
  console.log("This is rec date !!!!!: ", recpdate);

  // Insert into th_user table
  const user_data_insert = `INSERT INTO th_user (
    username, user_mobile, mobile2, user_email, user_epwd, user_address, address2,
    user_date_birth, father_r_husband, company_address, user_photo, photo_user_sign,
    mem_payment, mem_amnt, member_bank, membership_det_no, share_cert_no,
    comformation_no, mr_mrs_ms, user_status, created_date, reference_name_,
    reference_designation, ref_service_id_no, ref_relationship_with_applicant, member_pid,senior_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const user_values = [
    name,
    mobileNumber,
    altMobileNumber,
    email,
    user_epwd,
    residenceAddress,
    correspondenceAddress,
    dob,
    fatherHusbandName,
    workingAddress,
    memberPhotoBase64,
    memberSignBase64,
    paymentTypeDropdown,
    amount,

    bankNameInput,
    membershipNo,
    shareCertificateNo,
    confirmationNo,
    salutationDropdown,
    user_status,
    recpdate,
    refname,
    refdesignation,
    refidNo,
    relationship,
    member_PId,
    seniorityID,
  ];

  conn.query(user_data_insert, user_values, (err, result) => {
    if (err) {
      console.error("Error inserting user data:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.log("Data inserted into user table successfully");
      const lastInsertedUserPk = result.insertId;
      console.log("this is plotsizefk : ", PlotsizePk);
      const pro_pk = `SELECT pro_land_pk FROM th_project_land where plotsize_fk =?`;

      conn.query(pro_pk, PlotsizePk, (err, result) => {
        if (err) {
          console.error("Error fetching pro_pk:", err);
        } else {
          console.log("fetched successfully");

          const pro_land_pk = result[0].pro_land_pk;

          // Insert into th_user_project table
          const user_pro_qry = `INSERT INTO th_user_project (
        user_seniority_id, project_fk, project_land_fk, property_price, nominess_name,
        nominess_relationship, nominess_age, nominess_addr, user_fk, created_date,
        prop_dimension, project_size, sqft_rate, property_mid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const user_pro_values = [
            seniorityID,
            projectDropdown,
            pro_land_pk,
            selectedPropertyCost,
            nomineename,
            nomineeRelationship,
            nomineeage,
            nomineeaddress,
            lastInsertedUserPk,
            recpdate,
            plotDimensionDropdown,
            total_property_size,
            perSqftPrice,
            member_PId,
          ];
          conn.query(user_pro_qry, user_pro_values, (err, res) => {
            if (err) {
              console.error("Error inserting user project data:", err);
            } else {
              console.log("Data inserted into user_project table successfully");
              const lastInsertedproPk = res.insertId;

              // Insert into th_receipt table
              // Insert into th_receipt table
              const rec_qury = `INSERT INTO th_receipt (
            receipt_no, receipt_date, user_fk, user_project_fk, payment_mode, payment_amnt,
            cheque_no, transaction_id, dd_no, branch, bank_name, share, member_fee,
            admission_fee, share_fee, application_fee, miscellaneous,created_date,
            adv_amnt1, cr_installment, rname, raddress ,cheque_dd_transaction_id ,payment_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`;

              const rec_qury_values = [
                receiptNo,
                recpdate,
                member_PId,
                projectDropdown,
                paymentModeDropdown,
                amount,
                dynamicLabel,
                dynamicLabel,
                dynamicLabel,
                branchNameInput,
                bankNameInput,
                noOfShares,
                membershipFee,
                admissionFee,
                shareFee,
                applicationFee,
                miscExpenses,
                recpdate,
                paymentTypeDropdown,
                "0",
                name,
                residenceAddress,
                dynamicLabel,
                paymentTypeDropdown,
              ];

              console.log("This is rec data --- ", rec_qury_values);

              conn.query(rec_qury, rec_qury_values, (err, rows) => {
                if (err) {
                  console.error("Error inserting receipt data:", err);
                } else {
                  console.log(
                    "Data inserted into th_receipt table successfully"
                  );
                  const lastInsertedrecPk = rows.insertId;

                  // Insert into th_user_history_amnt table
                  const user_history_amnt_qry = `INSERT INTO th_user_history_amnt (
                payment_type, adv_r_installm, history_amnt, payment, cheque_no, bank_name,
                branch, transaction_id, dd_no, user_fk, user_project_fk,
                project_fk, receipt_fk
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                  const user_history_amnt_qry_values = [
                    paymentTypeDropdown,
                    amount,
                    paymentModeDropdown,
                    dynamicLabel,
                    bankNameInput,
                    branchNameInput,
                    dynamicLabel,
                    dynamicLabel,
                    dynamicLabel,
                    lastInsertedUserPk,
                    lastInsertedproPk,
                    projectDropdown,
                    lastInsertedrecPk,
                  ];

                  conn.query(
                    user_history_amnt_qry,
                    user_history_amnt_qry_values,
                    (err, results) => {
                      if (err) {
                        console.error(
                          "Error inserting user history amount data:",
                          err
                        );
                      } else {
                        console.log(
                          "Data inserted into th_user_history_amnt table successfully"
                        );
                      }
                    }
                  );

                  // Insert into th_logged_report table
                  const log_report_user = `INSERT INTO th_logged_report (
                category, sub_category, user_fk, user_name, user_seniority_id, project_name,
                receipt_no, description, created_dtm
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                  const log_report_user_values = [
                    "User",
                    "New user created",
                    lastInsertedUserPk,
                    name,
                    seniorityID,
                    pro_name,
                    "",
                    "",
                    recpdate,
                  ];

                  const log_report_receipt = `INSERT INTO th_logged_report (
                category, sub_category, user_fk, user_name, user_seniority_id, project_name,
                receipt_no, description, created_dtm
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                  const log_report_receipt_values = [
                    "Receipt",
                    "New receipt created",
                    lastInsertedUserPk,
                    name,
                    seniorityID,
                    pro_name,
                    receiptNo,
                    "",
                    recpdate,
                  ];

                  conn.query(
                    log_report_user,
                    log_report_user_values,
                    (err, results) => {
                      if (err) {
                        console.error(
                          "Error inserting into log for user:",
                          err
                        );
                      } else {
                        console.log("New user log entry created");
                      }
                    }
                  );

                  conn.query(
                    log_report_receipt,
                    log_report_receipt_values,
                    (err, results) => {
                      if (err) {
                        console.error(
                          "Error inserting into log for receipt:",
                          err
                        );
                      } else {
                        console.log("New receipt log entry created");
                      }
                    }
                  );

                  // Continue with other queries and logic as needed...
                }
              });
            }
          });
        }
      });

      res.status(200).json({
        status: 200,
        message: "Data inserted into database successfully",
      });
    }
  });
});

// router.post("/insertdata", (req, res) => {
//   const {
//     refname,
//     refdesignation,
//     refidNo,
//     relationship,
//     projectDropdown,
//     pro_name,
//     plotDimensionDropdown,
//     PlotsizePk,
//     total_property_size,
//     perSqftPrice,
//     selectedPropertyCost,
//     percentageCost,
//     salutationDropdown,
//     name,
//     mobileNumber,
//     altMobileNumber,
//     email,
//     dob,
//     fatherHusbandName,
//     residenceAddress,
//     correspondenceAddress,
//     workingAddress,
//     memberPhotoBase64,
//     memberSignBase64,
//     nomineename,
//     nomineeage,
//     nomineeRelationship,
//     nomineeaddress,
//     seniorityID,
//     membershipNo,
//     confirmationNo,
//     shareCertificateNo,
//     receiptNo,
//     recpdate,
//     noOfShares,
//     shareFee,
//     membershipFee,
//     applicationFee,
//     admissionFee,
//     miscExpenses,
//     paymentDetails,
//   } = req.body;

//   console.log("share_certificate_no", req.body.shareCertificateNo);

//   // 🔍 1. Check if receipt number exists
//   const checkReceiptExists =
//     "SELECT COUNT(*) AS count FROM th_receipt WHERE receipt_no = ?";
//   conn.query(checkReceiptExists, [receiptNo], (err, result) => {
//     if (err) {
//       console.error("Error checking receipt number", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     if (result[0].count > 0) {
//       return res.status(400).json({ error: "Receipt number already exists" });
//     }

//     // 🔄 Generate IDs
//     const member_PId = generateRandomString(6);
//     const user_epwd = generatePwd(8);
//     const user_status = 0;

//     // 📝 2. Insert User Data
//     const userInsertQuery = `INSERT INTO th_user (username, user_mobile, mobile2, user_email, user_epwd, user_address,
//       address2, user_date_birth, father_r_husband, company_address, user_photo, photo_user_sign, mem_payment, mem_amnt,
//       member_bank, membership_det_no, share_cert_no, comformation_no, mr_mrs_ms, user_status, created_date,
//       reference_name_, reference_designation, ref_service_id_no, ref_relationship_with_applicant, member_pid, senior_id)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const userInsertValues = [
//       name,
//       mobileNumber,
//       altMobileNumber,
//       email,
//       user_epwd,
//       residenceAddress,
//       correspondenceAddress,
//       dob,
//       fatherHusbandName,
//       workingAddress,
//       memberPhotoBase64,
//       memberSignBase64,
//       paymentDetails[0].paymentTypeDropdown,
//       paymentDetails[0].amount,
//       paymentDetails[0].bankNameInput,
//       membershipNo,
//       shareCertificateNo,
//       confirmationNo,
//       salutationDropdown,
//       user_status,
//       recpdate,
//       refname,
//       refdesignation,
//       refidNo,
//       relationship,
//       member_PId,
//       seniorityID,
//     ];

//     console.log("user_insert_values", userInsertValues);

//     conn.query(userInsertQuery, userInsertValues, (err, userResult) => {
//       if (err) {
//         console.error("Error inserting user data:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       const lastInsertedUserPk = userResult.insertId;

//       // 🔍 3. Get `pro_land_pk`
//       const proQuery =
//         "SELECT pro_land_pk FROM th_project_land WHERE plotsize_fk = ?";
//       conn.query(proQuery, [PlotsizePk], (err, proResult) => {
//         if (err || proResult.length === 0) {
//           console.error("Error fetching pro_land_pk:", err);
//           return res.status(500).json({ error: "Invalid plot size" });
//         }

//         const pro_land_pk = proResult[0].pro_land_pk;

//         // 🏠 4. Insert into `th_user_project`
//         const userProjectQuery = `INSERT INTO th_user_project (user_seniority_id, project_fk, project_land_fk, property_price,
//           nominess_name, nominess_relationship, nominess_age, nominess_addr, user_fk, created_date, prop_dimension,
//           project_size, sqft_rate, property_mid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//         const userProjectValues = [
//           seniorityID,
//           projectDropdown,
//           pro_land_pk,
//           selectedPropertyCost,
//           nomineename,
//           nomineeRelationship,
//           nomineeage,
//           nomineeaddress,
//           lastInsertedUserPk,
//           recpdate,
//           plotDimensionDropdown,
//           total_property_size,
//           perSqftPrice,
//           member_PId,
//           shareCertificateNo,
//         ];

//         conn.query(
//           userProjectQuery,
//           userProjectValues,
//           (err, projectResult) => {
//             if (err) {
//               console.error("Error inserting user project data:", err);
//               return res.status(500).json({ error: "Internal Server Error" });
//             }

//             // 🧾 5. Insert into `th_receipt`
//             const receiptQuery = `INSERT INTO th_receipt (receipt_no, receipt_date, user_fk, user_project_fk, payment_mode,
//             payment_amnt, cheque_no, transaction_id, dd_no, branch, bank_name, share, member_fee, admission_fee, share_fee,
//             application_fee, miscellaneous, created_date, adv_amnt1, cr_installment, rname, raddress, cheque_dd_transaction_id,
//             payment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//             const receiptValues = [
//               receiptNo,
//               recpdate,
//               member_PId,
//               projectDropdown,
//               paymentDetails[0].paymentModeDropdown,
//               paymentDetails[0].amount,
//               paymentDetails[0].dynamicLabel,
//               paymentDetails[0].dynamicLabel,
//               paymentDetails[0].dynamicLabel,
//               paymentDetails[0].branchNameInput,
//               paymentDetails[0].bankNameInput,
//               noOfShares,
//               membershipFee,
//               admissionFee,
//               shareFee,
//               applicationFee,
//               miscExpenses,
//               recpdate,
//               paymentDetails[0].paymentTypeDropdown,
//               "0",
//               name,
//               residenceAddress,
//               paymentDetails[0].dynamicLabel,
//               paymentDetails[0].paymentTypeDropdown,
//             ];

//             conn.query(receiptQuery, receiptValues, (err, receiptResult) => {
//               if (err) {
//                 console.error("Error inserting receipt data:", err);
//                 return res.status(500).json({ error: "Internal Server Error" });
//               }

//               res
//                 .status(200)
//                 .json({ status: 200, message: "Data inserted successfully" });
//             });
//           }
//         );
//       });
//     });
//   });
// });

router.get("/viewSeniorityId", (req, res) => {
  const get_seniority_id = `SELECT senior_id FROM th_user`;
  console.log("get_seniority_id", get_seniority_id);

  conn.query(get_seniority_id, (err, result) => {
    if (err) {
      console.error("Error getting the data", err);
      res.status(500).json({ error: "Error getting the data" });
    } else {
      console.log("Data fetched successfully");
      // Extract only receipt_no values into a flat array
      const seniorityIDs = result.map((row) => row.senior_id);
      res
        .status(200)
        .json({ message: "Data fetched successfully", seniorityIDs });
    }
  });
});

router.get("/viewShareCertificateNo", (req, res) => {
  const get_share_certificate_no = `SELECT share_cert_no FROM th_user`;
  console.log("get_share_certificate_no", get_share_certificate_no);

  conn.query(get_share_certificate_no, (err, result) => {
    if (err) {
      console.error("Error getting the data", err);
      res.status(500).json({ error: "Error getting the data" });
    } else {
      console.log("Data fetched successfully");
      // Extract only receipt_no values into a flat array
      const share_certificate_nos = result.map((row) => row.share_cert_no);
      res
        .status(200)
        .json({ message: "Data fetched successfully", share_certificate_nos });
    }
  });
});

router.get("/viewdata", (req, res) => {
  // Construct the SQL query to fetch specific columns from th_user table
  const sql = `
        SELECT 
            username,
            user_mobile,
            user_email,
            user_epwd,
            user_status,
            senior_id
            FROM 
            th_user
    `;

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

router.get("/viewmembers", (req, res) => {
  const disableOnlyFullGroupBy = `SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`;
  conn.query(disableOnlyFullGroupBy, (err) => {
    if (err) {
      console.error("Error disabling ONLY_FULL_GROUP_BY:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const sql = `SELECT th_user.*,
              th_user_project.*, 
             th_projects.*, 
             SUM(th_receipt.payment_amnt) - 2500 as paid_amount, 
              CASE WHEN th_user.user_status = 0 THEN 'Active' ELSE 'Inactive' END AS status 
              FROM th_user JOIN th_user_project ON th_user_project.user_fk = th_user.user_pk 
               JOIN th_projects ON th_projects.project_id = th_user_project.project_fk LEFT 
               JOIN th_receipt ON th_receipt.user_fk = th_user.member_pid 
               GROUP BY th_user.user_pk, th_user_project.user_fk, th_projects.project_id
                ORDER BY th_user.user_pk DESC `;

      // Execute the SQL query
      conn.query(sql, (err, rows) => {
        if (err) {
          console.error("Error fetching user data:", err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          console.log(rows, "this is view member datas");

          // Send the fetched data as a JSON response
          res.status(200).json(rows);
        }
      });
    }
  });
});

router.get("/viewmembers/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("userId", userId);

    const query = `
      SELECT 
          u.user_pk,
          u.username, 
          u.user_email,
          u.user_mobile,
          u.user_address,
          u.member_pid,
          u.senior_id,
          up.prop_dimension,
          p.pro_name,
          tr.user_project_fk,
          tr.payment_mode,
          tr.adv_amnt1,
          tr.cheque_no,
          tr.bank_name,
          tr.branch,
          tr.payment_amnt,
          tr.transaction_id,
          tr.dd_no,
          tr.created_date,
          tr.receipt_pk,
          tr.cheque_dd_transaction_id,
          tr.payment_type,
          tr.raddress,
          up.user_project_pk
      FROM 
          th_user u
      LEFT JOIN 
          th_user_project up ON u.user_pk = up.user_fk
      LEFT JOIN 
          th_projects p ON up.project_fk = p.project_id
      LEFT JOIN 
          th_receipt tr ON u.member_pid = tr.user_fk
      WHERE 
          u.user_pk = ?
       ORDER BY
          u.user_pk DESC
    `;

    conn.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).send("Error fetching user data");
      }

      // Convert created_date to the desired time zone
      result.forEach((row) => {
        row.created_date = moment(row.created_date).tz("Asia/Kolkata").format();
      });

      // Send the fetched user data as a JSON response
      res.status(200).json(result);
      console.log("This is the Data!!!", result);
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Error fetching user data");
  }
});

router.get("/getThUserPk", (req, res) => {
  const userId = req.query.userId;

  // Construct SQL query to fetch th_user_pk based on userId
  const sql =
    "SELECT th_user_project.user_project_pk FROM th_user_project WHERE th_user_project.user_fk = ?";

  // Execute SQL query with userId as parameter
  conn.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching th_user_pk:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // If there are rows returned, extract th_user_pk from the first row
      if (rows.length > 0) {
        const thUserPk = rows[0].user_project_pk;
        res.status(200).json({ th_user_pk: thUserPk });
      } else {
        // If no rows are returned, userId is not found
        res.status(404).json({ error: "User not found" });
      }
    }
  });
});

router.post("/updateReceiptNo/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const receiptNo = req.body.receiptNo; // Assuming the receipt number is sent in the request body

    // Construct the SQL query to update the receipt number for the user
    const updateQuery = `
      UPDATE th_receipt
      SET receipt_no = ?
      WHERE user_fk IN (
        SELECT property_mid
        FROM th_user_project
        WHERE user_fk = ?
      )
    `;

    // Execute the SQL query with the receipt number and user ID parameters
    conn.query(updateQuery, [receiptNo, userId], (err, result) => {
      if (err) {
        console.error("Error updating receipt number:", err);
        return res.status(500).send("Error updating receipt number");
      }

      // Check if any rows were affected by the update
      if (result.affectedRows > 0) {
        // Receipt number updated successfully
        res.status(200).send("Receipt number updated successfully");
      } else {
        // No rows were affected, possibly due to no matching user
        res.status(404).send("No user found for the provided ID");
      }
    });
  } catch (error) {
    // Handle other errors
    console.error("Error updating receipt number:", error);
    res.status(500).send("Error updating receipt number");
  }
});

// Endpoint to update user status
// router.put("/updateUserStatus/:userId", (req, res) => {
//   const userId = req.params.userId;

//   // Construct SQL query to update user status
//   const sql = `
//       UPDATE th_user
//       SET user_status = 1
//       WHERE user_pk = ?`;

//   // Execute the SQL query with user id as parameter
//   conn.query(sql, [userId], (err, result) => {
//     if (err) {
//       console.error("Error updating user status:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       // Send success response
//       res.status(200).json({ message: "User status updated successfully" });
//     }
//   });
// });

// Endpoint to update user status
router.put("/updateUserStatus/:userId", (req, res) => {
  const userId = req.params.userId;

  // Construct SQL query to update user status
  const sql = `
      UPDATE th_user
      SET user_status = CASE WHEN user_status = 1 THEN 0 ELSE 1 END
      WHERE user_pk = ?`;

  // Execute the SQL query with user id as parameter
  conn.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // Send success response
      res.status(200).json({ message: "User status updated successfully" });
    }
  });
});

router.delete("/deleteUser/:userId", (req, res) => {
  const userId = req.params.userId;

  // Construct SQL query to delete the user
  const sql = `DELETE FROM th_user WHERE user_pk = ?`;

  // Execute the SQL query with user id as parameter
  conn.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // Send success response
      res.status(200).json({ message: "User deleted successfully" });
    }
  });
});

router.delete("/deletePaymentHistory/:receiptId", (req, res) => {
  const receiptId = req.params.receiptId;

  // Construct SQL query to delete the payment history entry
  const sql = `DELETE FROM th_receipt WHERE receipt_pk = ?`;

  // Execute the SQL query with receiptId as parameter
  conn.query(sql, [receiptId], (err, result) => {
    if (err) {
      console.error("Error deleting payment history entry:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // Send success response
      res
        .status(200)
        .json({ message: "Payment history entry deleted successfully" });
    }
  });
});

router.get("/totalUsers", (req, res) => {
  conn.query(
    // "SELECT COUNT(*) AS totalUsers FROM th_user WHERE user_status = 0",
    "SELECT COUNT(*) AS totalUsers FROM th_user",
    (err, result) => {
      if (err) {
        console.error("Error fetching total users:", err);
        res.status(500).json({ error: "An internal server error occurred" });
      } else {
        res.json({ totalUsers: result[0].totalUsers });
        console.log("total users", result[0]);
      }
    }
  );
});

router.get("/membdetails", (req, res) => {
  const qry = `SELECT
  th_user_project.*,
  th_user.username,
  th_user.user_pk,
  th_user.user_email,
  th_user.user_mobile,
  th_user.user_epwd,
  CASE
      WHEN th_user.user_status = 1 THEN 'Cancelled/Inactive'
      WHEN th_user.user_status = 0 THEN 'Active'
  END AS user_status_display
FROM
  th_user_project
JOIN
  th_user
ON
  th_user.member_pid = th_user_project.property_mid
ORDER BY
  th_user_project.project_fk,
  th_user_project.user_seniority_id ASC;
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

router.get("/inactivemenbers", (req, res) => {
  const qury = `SELECT 
  th_user.username, 
  th_user.user_pk, 
  th_user.user_email, 
  th_user.user_mobile, 
  th_user.user_address,
  th_user.father_r_husband, 
  th_user_project.*
FROM 
  th_user 
LEFT JOIN 
  th_user_project 
ON 
  th_user.user_pk = th_user_project.user_fk 
WHERE 
  th_user_project.user_fk IS NULL 
ORDER BY 
  th_user.user_pk DESC, 
  th_user_project.project_fk ASC;

  `;
  conn.query(qury, (err, result) => {
    if (err) {
      console.error("Error getting the data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Data fetched successfully");
    res.status(200).json({ message: "Data fetched successfully", result });
  });
});

router.post("/insert_receipt", (req, res) => {
  const { userId, thUserPk, paymentDetails } = req.body;

  const getUserQuery = "SELECT member_pid FROM th_user WHERE user_pk = ?";
  const getProjectQuery =
    "SELECT project_fk FROM th_user_project WHERE user_project_pk = ?";

  const fetchMemberPid = new Promise((resolve, reject) => {
    conn.query(getUserQuery, [userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0].member_pid);
      }
    });
  });

  const fetchProjectFk = new Promise((resolve, reject) => {
    conn.query(getProjectQuery, [thUserPk], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0].project_fk);
      }
    });
  });

  Promise.all([fetchMemberPid, fetchProjectFk])
    .then(([memberPid, projectFk]) => {
      const insertReceiptPromises = paymentDetails.map((detail) => {
        return new Promise((resolve, reject) => {
          const insertReceiptQuery =
            "INSERT INTO th_receipt (user_fk, user_project_fk, receipt_no, created_date, raddress, payment_type, payment_mode, bank_name, branch,  payment_amnt, cheque_dd_transaction_id, cr_installment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          conn.query(
            insertReceiptQuery,
            [
              memberPid,
              projectFk,
              detail.recno,
              detail.date,
              detail.receiptaddress,
              detail.paymentType,
              detail.paymentMode,
              detail.bankName,
              detail.branchName,
              detail.amount,
              detail.chequeDdTransactionId,
              detail.cr_installment,
            ],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                const receiptPk = result.insertId;
                const insertPaymentTypeQuery =
                  "INSERT INTO th_user_history_amnt (user_fk, user_project_fk, receipt_fk, payment_type, payment, bank_name, branch, cheque_dd_transaction_id, history_amnt, history_date, adv_r_installm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                conn.query(
                  insertPaymentTypeQuery,
                  [
                    userId,
                    thUserPk,
                    receiptPk,
                    detail.paymentType,
                    detail.paymentMode,
                    detail.bankName,
                    detail.branchName,
                    detail.chequeDdTransactionId,
                    detail.amount,
                    detail.date,
                    detail.cr_installment,
                  ],
                  (err, result) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  }
                );
              }
            }
          );
        });
      });

      return Promise.all(insertReceiptPromises);
    })
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Receipts inserted successfully" });
    })
    .catch((error) => {
      console.error("Error inserting receipts:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while inserting the receipts",
      });
    });
});

router.get("/get_conn_data", (req, res) => {
  console.log('function get_conn_data is called');
  
  const { user_pk , user_project_pk } = req.query;
  console.log(user_project_pk,'incoming project id');
  console.log(user_pk,'incoming user id');
  
  // Query to fetch user data
  const user_data_query = `SELECT * FROM th_user WHERE user_pk = ?`;

  conn.query(user_data_query, [user_pk], (err, userData) => {
    if (err) {
      console.error("Error getting user data:", err);
      return res.status(500).json({ error: "Error getting user data" });
    }
    if (userData && userData.length > 0) {
      const user = userData[0];
      const {
        username: membername,
        user_address: user_add,
        comformation_no,
      } = user;

      const user_pro_hist = `
SELECT g.payment_amnt, g.cheque_dd_transaction_id, g.payment_mode,  g.receipt_no, g.created_date, g.bank_name, g.branch,
e.username, e.user_address , d.pro_name , a.prop_dimension , a.sqft_rate , d.address , a.project_size,
e.membership_det_no , e.senior_id , d.confirmationmonth , e.comformation_no 
    FROM th_user_project AS a
    JOIN th_project_land AS b ON a.project_land_fk = b.pro_land_pk
    JOIN th_plotsize AS c ON b.plotsize_fk = c.plotsize_pk
    JOIN th_projects AS d ON a.project_fk = d.project_id
    JOIN th_user AS e ON a.user_fk = e.user_pk
    JOIN th_user_history_amnt AS f ON e.user_pk = f.user_fk AND a.user_project_pk = f.user_project_fk
    JOIN th_receipt AS g ON f.receipt_fk = g.receipt_pk
    WHERE a.user_project_pk = ?
    AND g.payment_amnt > 2500
`;

      conn.query(user_pro_hist, [user_project_pk], (err, projectData) => {
        if (err) {
          console.error("Error getting project data:", err);
          return res.status(500).json({ error: "Error getting project data" });
        }

        if (projectData && projectData.length > 0) {
          const project = projectData[0];
          const response = {
            user_pk: user_pk,
            user_project_pk: user_project_pk, // Include user_pk in the response

            message: "Data fetched successfully",
            membername,
            user_add,
            comformation_no, // Add comformation_no to response
            // Include other project-related fields here
            prop_dimension: project.prop_dimension,
            sqr: project.sqft_rate,
            senID: project.senior_id,
            pro_name: project.pro_name,
            pro_add: project.address,
            con_mon: project.confirmationmonth,
            memid: project.membership_det_no,
            sitedimension: project.project_size,
            rec_no: project.receipt_no,
            rec_dt: project.created_date,
            amnt: project.payment_amnt,
            pmt: project.payment_mode,
            transaction_id: project.cheque_dd_transaction_id,
            bank: project.bank_name,
            branch: project.branch,
          };
          res.status(200).json(response);
          console.log(response, "response when insert");
        } else {
          console.error("Project data not found or invalid");
          res.status(500).json({ error: "Project data not found or invalid" });
        }
      });
    } else {
      console.error("User data not found or invalid");
      res.status(500).json({ error: "User data not found or invalid" });
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the folder to store the uploaded files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Create a unique filename
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Combine field name, unique suffix, and extension
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "application/pdf",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error("Only image files and PDF files are allowed!")); // Reject other file types
    }
  },
});

router.post("/add_con_lett", upload.single("user_affidiafit"), (req, res) => {
  const {
    memberName,
    address,
    proname,
    prosize,
    persqft,
    projectaddress,
    date,
    amt,
    paymentmethod,
    refno,
    bankname,
    branch,
    sitedimension,
    recno,
    memid,
    sid,
    comformation_no,
    duration,
    issuedate,
    userid,
    userprojectpk,
  } = req.body;

  console.log("Received data:", req.body); // Debugging log
  console.log("Uploaded file:", req.file); // Debugging log for file

  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  // Read the PDF from disk and convert to base64
  // const filePath = path.join(__dirname, 'uploads', req.file.filename);
  const filePath = path.join(__dirname, "../uploads", req.file.filename);

  console.log("Reading file from path:", filePath); // Log the file path

  fs.readFile(filePath, (err, affidavitBuffer) => {
    if (err) {
      console.error("Error reading the PDF file:", err); // Log error details
      return res.status(500).json({ error: "Error reading the PDF file" });
    }

    const affidavitBase64 = affidavitBuffer.toString("base64");

    // Update confirmation number and affidavit in the database
    const updateConfirmationQuery = `
      UPDATE th_user
      SET comformation_no = ?, user_affidiafit = ?
      WHERE user_pk = ?
    `;

    conn.query(
      updateConfirmationQuery,
      [comformation_no, affidavitBase64, userid],
      (err, result) => {
        if (err) {
          console.error("Error updating comformation_no and affidavit:", err);
          return res.status(500).json({
            error: "Error updating comformation_no and affidavit",
            details: err.message,
          });
        }

        console.log("Update result:", result); // Debugging log

        // Insert the rest of the confirmation data
        const insertConfirmationQuery = `
        INSERT INTO confirmation (
          name1, name2, name3, name4, name5, name6, name7, name8, name9,
          name10, name11, name12, name13, name14, name15, name16, name17, user_fk, 
          user_project_fk, site_fk, issuedate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `;

        const values = [
          memberName,
          address,
          proname,
          prosize,
          persqft,
          projectaddress,
          date,
          amt,
          paymentmethod,
          refno,
          bankname,
          branch,
          sitedimension,
          recno,
          memid,
          sid,
          comformation_no,
          userid,
          userprojectpk,
          duration,
          issuedate,
        ];

        // Insert confirmation data
        conn.query(insertConfirmationQuery, values, (err, result) => {
          if (err) {
            console.error("Error inserting confirmation data:", err);
            return res.status(500).json({
              error: "Error inserting confirmation data",
              details: err.message,
            });
          }

          res
            .status(200)
            .json({ message: "Data updated and inserted successfully" });
        });
      }
    );
  });
});

module.exports = router;
