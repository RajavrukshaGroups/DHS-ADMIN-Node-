function submituserdata(event) {
  event.preventDefault();
  console.log("Submitting user data...");

  // Check if there's an error with the receipt number
  const errorElement = document.getElementById("receiptError");
  if (errorElement.style.display === "block") {
    alert(
      "Receipt number already exists. Please enter a unique receipt number."
    );
    return; // Prevent form submission if error is present
  }

  const seniorityIderrorElement = document.getElementById("seniorityIdError");
  if (seniorityIderrorElement.style.display === "block") {
    alert("Seniority Id already exists. Please enter a unique seniority Id.");
    return;
  }

  const shareCertificateNoErrorElement=document.getElementById("shareCertificateNoError");
  if(shareCertificateNoErrorElement.style.display === "block"){
    alert("Share Certificate No already exists. Please enter a unique share Certificate No.");
    return;
  }

  // Continue with the existing data collection
  const refname = document.getElementById("refname").value;
  console.log("Reference Name:", refname);
  const refdesignation = document.getElementById("refdesignation").value;
  console.log("Reference Designation:", refdesignation);
  const refidNo = document.getElementById("refidNo").value;
  const relationship = document.getElementById("relationship").value;
  const projectDropdown = document.getElementById("projectDropdown").value;
  const pro_name = document
    .getElementById("projectDropdown")
    .selectedOptions[0].getAttribute("pro_name");
  const PlotsizePk = document
    .getElementById("plotDimensionDropdown")
    .selectedOptions[0].getAttribute("data-plotsize-pk");
  const total_property_size = document
    .getElementById("plotDimensionDropdown")
    .selectedOptions[0].getAttribute("total-property-size");
  console.log("Project Dropdown ", projectDropdown);
  console.log("plot pk : ", PlotsizePk);
  const plotDimensionDropdown = document.getElementById(
    "plotDimensionDropdown"
  ).value;
  const perSqftPrice = document.getElementById("perSqftPrice").value;
  const selectedPropertyCost = document.getElementById(
    "selectedPropertyCost"
  ).value;
  const percentageCost = document.getElementById("percentageCost").value;
  const salutationDropdown =
    document.getElementById("salutationDropdown").value;
  const name = document.getElementById("name").value;
  const mobileNumber = document.getElementById("mobileNumber").value;
  const altMobileNumber = document.getElementById("altMobileNumber").value;
  const email = document.getElementById("email").value;
  const dob = document.getElementById("dob").value;
  const fatherHusbandName = document.getElementById("fatherHusbandName").value;
  const residenceAddress = document.getElementById("residenceAddress").value;
  const correspondenceAddress = document.getElementById(
    "correspondenceAddress"
  ).value;
  const workingAddress = document.getElementById("workingAddress").value;

  // Convert images to base64
  const memberPhotoInput = document.getElementById("memberPhoto");
  const memberSignInput = document.getElementById("memberSign");

  const nomineename = document.getElementById("nomineename").value;
  const nomineeage = document.getElementById("nomineeage").value;
  const nomineeRelationship = document.getElementById(
    "nomineeRelationship"
  ).value;
  const nomineeaddress = document.getElementById("nomineeaddress").value;
  const seniorityID = document.getElementById("seniorityID").value;
  const membershipNo = document.getElementById("membershipNo").value;
  const confirmationNo = document.getElementById("confirmationNo").value;
  const shareCertificateNo =
    document.getElementById("shareCertificateNo").value;
  const receiptNo = document.getElementById("receiptNo").value;
  const recpdate = document.getElementById("recpdate").value;
  const noOfShares = document.getElementById("noOfShares").value;
  const shareFee = document.getElementById("shareFee").value;
  const membershipFee = document.getElementById("membershipFee").value;
  const applicationFee = document.getElementById("applicationFee").value;
  const admissionFee = document.getElementById("admissionFee").value;
  const miscExpenses = document.getElementById("miscExpenses").value;
  console.log("miscExpenses : ", miscExpenses);

  const paymentCards = document.querySelectorAll(".payment-card");

  // Array to store payment details from all cards
  const paymentDetailsArray = [];

  // Loop through each payment card to capture payment details
  paymentCards.forEach((card) => {
    console.log("Card:", card);

    const paymentTypeDropdown = card.querySelector(
      ".payment-type-dropdown"
    ).value;
    console.log("Payment Type Dropdown:", paymentTypeDropdown);

    const paymentModeDropdown = card.querySelector(
      ".payment-mode-dropdown"
    ).value;
    console.log("Payment Mode Dropdown:", paymentModeDropdown);

    const bankNameInput = card.querySelector(".bank-name-input").value;
    console.log("Bank Name Input:", bankNameInput);

    const branchNameInput = card.querySelector(".branch-name-input").value;
    console.log("Branch Name Input:", branchNameInput);

    const amount = card.querySelector(".amount-input").value;
    console.log("Amount:", amount);

    const dynamicLabel = card.querySelector(".dynamic-input").value;
    console.log("Dynamic Label:", dynamicLabel);
    const installmentsDropdown = card.querySelector(
      ".installments-dropdown select"
    ).value;

    console.log("Installments Dropdown:", installmentsDropdown);

    // Push payment details from the current card to the array
    paymentDetailsArray.push({
      paymentTypeDropdown,
      paymentModeDropdown,
      bankNameInput,
      branchNameInput,
      amount,
      dynamicLabel,
      installmentsDropdown,
    });
  });

  const reader = new FileReader();

  reader.onload = function (event) {
    const memberPhotoBase64 = event.target.result;

    reader.onload = function (event) {
      const memberSignBase64 = event.target.result;

      const data = {
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
        paymentDetails: paymentDetailsArray,
      };

      const jsonData = JSON.stringify(data);
      console.log("json", jsonData);

      fetch("/users/insertdata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error:", data.details);
            document.getElementById(
              "submissionStatusMessage"
            ).innerText = `There was an error adding the user`;
          } else {
            console.log("Success:", data);
            document.getElementById("submissionStatusMessage").innerText =
              "User added successfully!";
          }
          $("#submissionStatusModal").modal("show");
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          document.getElementById("submissionStatusMessage").innerText =
            "There was an error adding the user.";
          $("#submissionStatusModal").modal("show");
        });
    };

    reader.readAsDataURL(memberSignInput.files[0]);
  };

  reader.readAsDataURL(memberPhotoInput.files[0]);
}
