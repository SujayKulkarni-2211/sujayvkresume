

document.addEventListener('DOMContentLoaded', function() {
  // Hide brand name initially
  var navbarBrand = document.querySelector('.navbar-brand');
  navbarBrand.classList.add('d-none');

  // Activate Scrollspy
  document.body.setAttribute('data-target', '.navbar');
  document.body.setAttribute('data-offset', '80');

  // Change Navbar Style on Scroll
  window.addEventListener('scroll', function () {
      if (document.documentElement.scrollTop > 200) {
          document.querySelector('.navbar').classList.add('scrolled');
          navbarBrand.classList.remove('d-none');
          document.querySelector('.navbar-nav').classList.remove('justify-content-center');
          document.querySelector('.navbar-nav').classList.add('ml-auto');
          document.querySelector('.navbar-nav').classList.add('d-flex');
          document.querySelector('.navbar-nav').classList.add('justify-content-end');
          
      } else {
          document.querySelector('.navbar').classList.remove('scrolled');
          navbarBrand.classList.add('d-none');
          document.querySelector('.navbar-nav').classList.remove('ml-auto');
      }
  });

  // ... Other functionalities remain unchanged ...
  // Scrollspy offset adjustment for smooth scrolling

  

  $(document).ready(function () {
    // Initialize tooltips for regular nav links
    $('[data-toggle="tooltip"]').tooltip();

    // Initialize tooltips for dropdown toggle button
    $('.dropdown-toggle').tooltip({
        container: 'body', // Ensure tooltips are appended to the body to avoid styling issues
    });

    // Initialize tooltips for dropdown menu items
    $('.dropdown-menu a').tooltip({
        container: 'body', // Ensure tooltips are appended to the body to avoid styling issues
    });

    // Handle click event for regular nav links
    $('[data-toggle="tooltip"]').on('click', function () {
        $(this).tooltip('hide');
    });

    // Handle click event for dropdown toggle button
    $('.dropdown-toggle').on('click', function () {
        $(this).tooltip('hide');
    });

    // Handle mouseout event for dropdown menu items
    $('.dropdown-menu a').on('mouseout', function () {
        $(this).tooltip('hide');
    });
});

document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactForm');
  

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault(); 
    let fullName = document.getElementById("fullName").value.trim();
    let email = document.getElementById("email").value;
    let msg=document.getElementById("message").value;
    
    
    if (fullName === '' || fullName.length < 3) {
      alert(`Don't you think "${fullName}" is very abstract, random, and short for me to remember you? Please provide a valid full name which I can remember to respond back to and is more than 3 characters!`);
    } 
    
    else {
      alert(`Thank you ${fullName} for contacting us. We will get back to you shortly on your email: ${email}`);
      
      
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('email', email);
        localStorage.setItem('message:', msg);

    

      
      console.log('Full Name:', fullName);
      console.log('Email:', email);
      console.log('Message:',msg);
    }

    contactForm.reset();
  });
});

});
