$(document).ready(function() {
    $(".forward").click(function() {
        let $son = $(this).children().last()
        $(this.nextElementSibling).toggleClass("show");
        $son.toggleClass("turn");
    })
})