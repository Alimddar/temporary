 $(document).ready(function () {
        $(".menu-icon i").click(() => {
          console.log("clicked")
            $(".overlay").addClass("show");
          $(".nav-aside").addClass("active");
          $("body").css({
            overflow: "hidden"
          })
        });

      
        $(".overlay").click(() => {
          console.log("bu root")
          $(".nav-aside").removeClass("active");
          $(".overlay").removeClass("show");
             $("body").css({
            overflow: "auto"
          })
        });

        $(window).scroll(() => {
          if($(window).scrollTop() > 90) {

            $(".nav-part").css({
              position: "fixed",
              backgroundColor: "#20202b",
              top:"0",
              margin: "0 auto",
              width: "100%",
              paddingBottom: "5px",
              zIndex: "99"
            });
          } else {
             $(".nav-part").css({
              position: "relative",
              top:"0",
              width: "85%",
              zIndex: "1"
            });
          }
        })
        
      });