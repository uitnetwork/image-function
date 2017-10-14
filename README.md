Image Function
===

Simple function to resize any uploaded images in Storage and create a thumbnail.

Usage
===

* Install [Node](https://nodejs.org/en/) 
* Install [Serverless](https://serverless.com/framework/) `npm install serverless -g`
* Clone the project `git clone https://github.com/uitnetwork/image-function.git`
* Create a [GCP](https://cloud.google.com/) project and change the configuration in [gcp-config.yml](./gcp-config.yml)
* Deploy `sls deploy`

Test
===

* Upload an image into the configured bucket
* In a few seconds, there will be a resized version uploaded in the same location
