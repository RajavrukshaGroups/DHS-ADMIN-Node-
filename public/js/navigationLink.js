document.addEventListener("DOMContentLoaded", function () {
    const backLink = document.getElementById("backLink");
  
    if (backLink) {
      backLink.addEventListener("click", function (event) {
        event.preventDefault();
        window.history.back();
      });
    }
  });
  