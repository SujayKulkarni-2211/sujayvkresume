


function toggleNavLinks() {
  var x = document.getElementById("navbar");
  var y=document.getElementsByClassName("hamburger-icon");
  if (x.className === "navbar") {
    x.className += " responsive";
    y.className += "responsive";

  } else {
    x.className = "navbar";
  }

}

