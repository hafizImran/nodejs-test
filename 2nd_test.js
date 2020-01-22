'use strict'
function task1(name , DOB)
{
    name = name.split("");
    DOB = DOB.split("");
    let result = '';
    for(var i = 0; i < name.length || i< DOB.length; i++) { 

        if(i < name.length) 
          result +=  name[i];

        if(i < DOB.length)  
          result +=  DOB[i];
    }
       return result;

}
//console.log(task1('dummy','123456'));
 

function task2(digit , identifier)
{
    identifier = identifier.toUpperCase();
    console.log(identifier);
    let remainder = digit%2;
    let array = [];

                    if(identifier == 'O') {

                      if (remainder == 0){
                      digit = digit - 1;
                    
                      for(let i=1 ; i <= digit ; i = i+2)
                            array.push(i);
                      
                      return array.sort();
                    }
                    else{
                      for(let i=1 ; i <= digit ; i = i+2)
                              array.push(i);

                        return array.sort();
                    }
                  }
                      if(identifier == 'E') {

                        if (remainder == 0){
                        //digit = digit - 1;
                      
                        for(let i=2 ; i <= digit ; i = i+2)
                              array.push(i);
                        
                        return array.sort();
                      }
                      else{
                        for(let i=2 ; i <= digit ; i = i+2)
                                array.push(i);

                          return array.sort();
                      }
                    } 

}
//console.log(task2('7','e'));


function task3(input){

  input = input.split("");
  input = input.sort();
  let result = {};
  for(let i=0 ; i<input.length ; i++)
  {
      if(!result[input[i]])
        result[input[i]] = 0;
      ++result[input[i]];
  }
  return result;
}
console.log(task3('apple'));