'use strict';

exports.http = (request, response) => {
  response.status(200).send('Hello World From Image Function!');
};

exports.event = (event, callback) => {
  callback();
};
