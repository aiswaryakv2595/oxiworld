const form = document.querySelector('#form');
const names = document.getElementById('name');
const email = document.querySelector('input[type=email]');
const phone = document.getElementById('phone');
const inputPassword = document.getElementById('inputPassword')
const confirmpass = document.getElementById('confirm')


form.addEventListener("submit", onSubmitFunction);

function onSubmitFunction(event){
    
    let errorMsg=new Array(); 
    
    if(names &&names.value==''){
        
        errorMsg.push("Please provide your number!");
    }  
    if(email.value==''){
        
        errorMsg.push("Please provide your email ID!");
    }  

    if(phone && phone.value==''){
        
        errorMsg.push("Please provide your Phone number!");
    }  
    var option=document.getElementsByName('gender');
     
    console.log(option.length);
if (option.length!=0 && !(option[0].checked || option[1].checked || option[2].checked)) {
    errorMsg.push("Please select one!");
}
if(inputPassword=='' || confirmpass==''){
    errorMsg.push("Please provide password!");
}
var messageHtml = "";
errorMsg.forEach(function (message) {
    messageHtml += "<li>" + message + "</li>";
});
if(errorMsg.length >0)
return true
if(errorMsg.length <= 0){
    event.preventDefault()//login will not work
document.getElementById("error").innerHTML = messageHtml;
return false

}


}
function promptfn(event){
    let a = confirm('are you sure want to delete')
    // event.preventDefault()
    console.log('result '+a);
    if (a==false) {
      return false
    } 
  }

