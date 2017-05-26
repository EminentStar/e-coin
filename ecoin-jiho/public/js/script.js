/*
  static nav bar
*/


console.log("==========================");
console.log("INSIDE Jiho's js/script.js");
console.log("==========================");



function add_money_prompt(amount, username) {
    
    console.log("send money");
    console.log("   username : " + username);
    console.log("   amount : " + amount);
    
    alert(username + "에 " + amount + "원을 충전했습니다!");
    document.getElementById("add-money-form").submit();
}



function send_money_prompt() {

    var username = document.forms["send-money-form"]["receiver"].value;
    var amount = document.forms["send-money-form"]["amount"].value;

    console.log("send money");
    console.log("   user : " + username);

    if (username.length == 0) {
        alert("Please Select a User!\n");
        return;
    }

    // var amount = prompt(username + "에게 얼마를 송금할까요?");
                         
    if (amount != null) {
        alert(amount+"를 보냈습니다!");

        document.forms["send-money-form"]["amount"].value = new Number(amount);

        document.getElementById("send-money-form").submit();
    }
}


