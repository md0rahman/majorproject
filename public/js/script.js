// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()



  document.querySelectorAll(".heartIcon").forEach(heart => {
    heart.addEventListener("click", (event) => {
      event.preventDefault();   // link open hone se roko
      event.stopPropagation();  // parent <a> click na ho

      if (heart.classList.contains("fa-regular")) {
        heart.classList.remove("fa-regular");
        heart.classList.add("fa-solid");
        heart.style.color = "red";
      } else {
        heart.classList.remove("fa-solid");
        heart.classList.add("fa-regular");
        heart.style.color = "white";
      }
    });
  });




