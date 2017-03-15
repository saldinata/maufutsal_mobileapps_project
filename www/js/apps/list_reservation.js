var db    = window.openDatabase("maufutsal_mail", "1.0", "maufutsal_mail", 200000);

function errorCB(err) 
{
  alert("Error processing SQL: "+err.code);
}


function successCB() 
{
  alert("success!");
}


var initApps = function()
{
  hideClearBtn();
  regcalc();
  $("#search_data").focus(focusOnSearchData);
  $("#search_data").focusout(focusOutSearchData);
  $("#clear_btn").click(clearSearchField);
  $("#search_btn").click(searchData);
}

$(document).ready(initApps);
$(document).on("click", "a[id^=reserv]", gotoReservationProcess);


function gotoReservationProcess()
{
  var numbering = parseInt(this.id.replace("reserv", ""), 10);
  var court_reg = $("#coreg"+numbering).val();

  console.log("court reg : "+court_reg);

  // db.transaction
  // (
  //   function(tx) 
  //   {        
  //     tx.executeSql('DELETE FROM courtregtbl');
  //   }, errorCB, successCB
  // );

  db.transaction
  (
    function(tx) 
    {        
      tx.executeSql('INSERT INTO courtregtbl (courtreg) VALUES ("' + court_reg+ '")');
    }, errorCB, successCB
  );

  document.location.href="mulai_reserv.html";
}


function focusOnSearchData()
{
  showClearBtn();
}


function focusOutSearchData()
{
  var data_search = document.getElementById("search_data").value;

  if(data_search!="")
  {
    showClearBtn();
  }
  else
  {
    hideClearBtn();
  }
}


function showClearBtn()
{
  $("#clear_btn").show();
}


function hideClearBtn()
{
  $("#clear_btn").hide();
  $("#field_not_registered").hide();
  console.log("starting hide clear button...");
} 


function clearSearchField()
{
  document.getElementById("search_data").value="";
  $("#search_data").focus();
  //hideClearBtn();
}


function regcalc()
{
  $.ajax
  ({
    type      : "POST",
    //url       : "http://localhost/maufutsal_website/api_mobile/mosapi.php",
    url       : "http://www.maufutsal.com/api_mobile/mosapi.php",
    data      : "type=reqcalcallfield",
    dataType  : "JSON",
    cache     : false,
    async     : false,
    success   : function(JSONObject)
    {
      for(var key in JSONObject)
      {
        if(JSONObject.hasOwnProperty(key))
        {
          if(JSONObject[key]["type"]==="rescalcallfield")
          {
            $("#total_field").html(JSONObject[key]["total_field"]);
          }
        }
      }
    } 
  });
  return false;
}


function searchData()
{
  var data_search     = document.getElementById('search_data').value;
  var city_id         = [];
  var court_reg       = [];
  var state           = "";
  var count           = 0;
  var contents        = "";
  var show_available  = 0;

  $("#key_search").html(data_search);

  if(data_search=="")
  {
    regcalc();
    $("#default_view").css("display","block");
    $("#search_result_view").css("display","none");
  }
  else
  {
    $("#default_view").css("display","none");
    $("#search_result_view").css("display","block");

    $.ajax
    ({
      type      : "POST",
      //url       : "http://localhost/maufutsal_website/api_mobile/mosapi.php",
      url       : "http://www.maufutsal.com/api_mobile/mosapi.php",
      data      : "type=reqsearchfield"+"&key="+data_search,
      dataType  : "JSON",
      cache     : false,
      async     : false,
      success   : function(JSONObject)
      {
        for(var key in JSONObject)
        {
          if(JSONObject.hasOwnProperty(key))
          {
            if(JSONObject[key]["type"]==="ressearchfield")
            {
              if(JSONObject[key]["found"]==="yes")
              {
                $("#not_found").hide();

                if((JSONObject[key]["court_reg"])==="-")
                {
                  var city_id_data  = JSONObject[key]["id_kota"];
                  console.log(city_id_data);
                  city_id[count]    = city_id_data;
                  count++;
                  state     = 0;
                }
                else
                {
                  var court_reg_data  = JSONObject[key]["court_reg"];
                  court_reg[count]    = court_reg_data;
                  count++;
                  state     = 1;
                }
              }
              else
              {
                state = -1;
                contents = "";
                $("#search_result_city_id").html(contents);
                $("#not_found").show();
              }
            }
          }
        }

        console.log("date state ="+state);

        if(state == 0)
        {
          $.ajax
          ({
            type      : "POST",
            //url       : "http://localhost/maufutsal_website/api_mobile/mosapi.php",
            url       : "http://www.maufutsal.com/api_mobile/mosapi.php",
            data      : "type=reqshowfieldlistcityid"+"&city_id="+city_id,
            dataType  : "JSON",
            cache     : false,
            async     : false,
            success   : function(JSONObject)
            {
              var count = 0;

              for(var key in JSONObject)
              {
                count++;

                if(JSONObject.hasOwnProperty(key))
                {
                  if(JSONObject[key]["type"]==="resshowfieldlistcityid")
                  {
                    if(JSONObject[key]["found"]==="yes")
                    {
                      show_available  = 1;

                      var court_name  = JSONObject[key]["court_name"];
                      var court_reg   = JSONObject[key]["court_reg"];
                      var price       = JSONObject[key]["normal_price"];
                      var city        = JSONObject[key]["id_kota"];

                      $("#field_not_registered").hide();

                      contents += "<div class=\"card activity\">";
                      contents += "<p style=\"font-size: 18px;color:#000;\">"+court_name+"</p>";
                      contents += "<span class=\"activity-time text-large text-light\">";
                      contents += "<span class=\"\" style=\"font-size: 15px;color:#000;\">Harga Mulai IDR "+price+"</span></span>";
                      contents += "<br>";
                      contents += "<span class=\"activity-time text-small text-light\">";
                      contents += "<span class=\"\" style=\"color:#000;\">"+city+"</span>";
                      contents += "</span>";
                      contents += "<br><br>";
                      
                      contents += "<div class=\"center-align\">";
                      contents += "<a class=\"waves-effect waves-light btn-large grey-light-flat-color\" href=\"#\">Info</a>&nbsp;";
                      contents += "<a class=\"waves-effect waves-light btn-large grey-light-flat-color\" href=\"#\">Peta</a>&nbsp;";
                      contents += "<a class=\"waves-effect waves-light btn-large green-light-flat-color\" href=\"#\" id=\"reserv"+count+"\" >Pesan</a>&nbsp;";
                      contents += "<input type=\"hidden\" value=\""+court_reg+"\" id=\"coreg"+count+"\" readonly autocomplete=\"off\"/>";
                      contents += "</div>";
                      contents += "</div>";
                      contents += "<br>";

                      $("#search_result_city_id").html(contents);
                    }
                    else
                    {
                      if(show_available==1)
                      {
                        //nothing to show
                      }
                      else
                      {
                        contents = "";
                        $("#search_result_city_id").html(contents);
                        $("#field_not_registered").show();
                      }
                    }
                  }
                }
              }
            }
           });
           return false;
        }
        else
        {
          $.ajax
          ({
            type      : "POST",
            //url       : "http://localhost/maufutsal_website/api_mobile/mosapi.php",
            url       : "http://www.maufutsal.com/api_mobile/mosapi.php",
            data      : "type=reqshowfieldlistcourtreg"+"&court_reg="+court_reg,
            dataType  : "JSON",
            cache     : false,
            async     : false,
            success   : function(JSONObject)
            {
              for(var key in JSONObject)
              {
                if(JSONObject.hasOwnProperty(key))
                {
                  if(JSONObject[key]["type"]==="resshowfieldlistcourtreg")
                  {
                    if(JSONObject[key]["found"]==="yes")
                    {
                      show_available  = 1;
                      var court_name  = JSONObject[key]["court_name"];
                      var price       = JSONObject[key]["normal_price"];
                      var city        = JSONObject[key]["id_kota"];

                      $("#field_not_registered").hide();

                      contents += "<div class=\"card activity\">";
                      contents += "<p style=\"font-size: 18px;color:#000;\">"+court_name+"</p>";
                      contents += "<span class=\"activity-time text-large text-light\">";
                      contents += "<span class=\"\" style=\"font-size: 15px;color:#000;\">Harga Mulai IDR "+price+"</span></span>";
                      contents += "<br>";
                      contents += "<span class=\"activity-time text-small text-light\">";
                      contents += "<span class=\"\" style=\"color:#000;\">"+city+"</span>";
                      contents += "</span>";
                      contents += "<br><br>";
                      
                      contents += "<div class=\"center-align\">";
                      contents += "<a class=\"waves-effect waves-light btn-large grey-light-flat-color\" href=\"#\">Info</a>&nbsp;";
                      contents += "<a class=\"waves-effect waves-light btn-large grey-light-flat-color\" href=\"#\">Peta</a>&nbsp;";
                      contents += "<a class=\"waves-effect waves-light btn-large green-light-flat-color\" href=\"mulai_reserv.html\">Pesan</a>&nbsp;";
                      contents += "</div>";
                      contents += "</div>";
                      contents += "<br>";

                      $("#search_result_city_id").html(contents);
                    }
                    else
                    {

                      if(show_available==1)
                      {
                        //nothing to show
                      }
                      else
                      {
                        contents = "";
                        $("#search_result_city_id").html(contents);
                        $("#field_not_registered").show();
                      }
                    }
                  }
                }
              }
            }
          });
          return false;
        }
      }
    });
    return false;
  }
}


// document.onkeydown=function(evt)
// {
//   var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;

//   if(keycode == 13)
//   {
//     searchData();
//   }
// }