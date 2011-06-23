/* plate.js: templating language.
 * Copyright (c) 2011 Thaddee Tyl, Jan Keromnes. All rights reserved. */

(function () {




Plate = {};
Plate._escape = function (text) {
  return text.replace ('{{','{').replace ('}}','}');
};
Plate.trans = function (text, literal) {
  var opencurl = /(?:^|[^\{])\{\{[^\{]/;
  var closecurl = /(?:^|[^\}])\}\}(?!\})/;

  // Find the first {{ there is.
  var operation = opencurl.exec (text);
  if (operation === null) { return Plate._escape (text); }
  var firstcurl = operation.index+1;

  // Find the next }} there is after that.
  var nextcurl = closecurl.exec (text.slice (firstcurl)).index+1 + firstcurl;
  //var nextcurl = text.indexOf ('}}', firstcurl);

  // Count the number of {{ in between.
  var countopencurl = 0;
  while ((firstcurl = (opencurl.exec (text.slice (firstcurl+2)) !== null?
                       opencurl.exec (text.slice (firstcurl+2)).index+1
                       + firstcurl+2: 0))
         < nextcurl  &&  firstcurl > operation.index+1) {
    countopencurl ++;
  }

  // Skip as many }}.
  for (var i=0;  i < countopencurl;  i++) {
    //nextcurl = text.indexOf ('}}', nextcurl+2);
    nextcurl = closecurl.exec (text.slice (nextcurl+2)).index+1 + nextcurl+2;
  }
  
  var span = text.slice (operation.index+1 + 3, nextcurl);
  ///console.log (span);
  
  // Use macro.
  var macro = operation[0][3];

  // Fragment the parameters.
  var params = [];
  var semi = span.indexOf (';');
  var prevpipe = pipe = 0;
  while ((pipe = span.indexOf ('|', pipe)) > -1
         && (semi>0? pipe < semi: true)) {
    params.push (span.slice (prevpipe, pipe));
    prevpipe = (pipe ++) + 1;
  }
  if (semi > 0) {
    params.push (span.slice (prevpipe, semi));
    prevpipe = semi+1;
  }
  params.push (span.slice (prevpipe));
  ///console.log (params);

  // Call the macro.
  return Plate._escape (text.slice (0, operation.index+1)) +
      Plate._escape (Plate.macros[macro] (literal, params)) +
      ((nextcurl+=2) > text.length? '':
      Plate.trans (text.slice (nextcurl), literal));

};

Plate.macros = {
  '=': function (literal, params) {
    return literal[params[0]];
  },
  '-': function (literal, params) {
    var list = '';
    var newliteral = literal;
    for (var i in literal[params[2]]) {
      newliteral[params[0]] = literal[params[2]][i];
      newliteral[params[1]] = i;
      list += Plate.trans (params[3], literal);
    }
    return list;
    //return Plate.trans (params[3], literal);
  }
};


var text = 'There is {{{so much}}} {{=a man|plain}} can do.\n\n{{=My friend|capitalize}} has many friends: \n{{-friend|i|friends;there is {{=friend|plain}}, }}...';
console.log (Plate.trans (text, {
  'a man': 'Jan',
  'My friend': 'Yann',
  'this friend': 'Thaddee',
  'friends': ['Thaddee', 'Serge', 'Marie']
}));


})();