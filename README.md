# Multer-Storage-S3
AWS S3 Multer Storage Engine

Multer Storage Engine that uses Amazon S3 as a storage system. Uses an offical AWS SDK.

## Installation
	
	npm install multer-storage-s3
	
## Dependencies
* aws-sdk - for communication with the S3
* crypto  - for generating a psudo random filename if one is not provided
* path    - for precise paths handling

## Usage
Multer-Storage-S3 follows the naming convention set by an existing DiskStorage storage engine that comes with multer.
```
var multer = require( 'multer' );
var s3 = require( 'multer-storage-s3' );
var storage = s3({
	destination : function( req, file, cb ) {
		
		cb( null, 'multer-uploads/my-files' );
		
	},
	filename    : function( req, file, cb ) {
		
		cb( null, file.fieldname + '-' + Date.now() );
		
	},
	bucket      : 'bucket-name',
	region      : 'us-west-2'
});
var uploadMiddleware = multer({ storage: storage });

app.post( '/upload', uploadMiddleware.single( 'attachment' ), function( req, res, next ) {

	res.send( 'File was uploaded successfully!' );

});
```

You will notice that we have not specified our AWS `access key` or `secret access key`. This is because you can't pass your AWS credentials directly to the Multer-Storage-S3. It would be pretty dangerous to have those credentials written in the code that you will most likely store on GitHub or some other repository. Instead, you should set those parameters as an environment variables.

The easiest way to do that is to use a `dotenv` npm package in your project (as soon as possible):

	require( 'dotenv' ).load();
	
Then, simply create an .env file in your project directoy, and add this:
```
AWS_ACCESS_KEY_ID=XXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=YYYYYYYYYYYY
```

Of course, you can export environment variables globally as well, this is just a more handy way. Make sure you add .env file to your `.gitignore` as you do not want to store that file on the repo.

If you want, you can also define your bucket, as well as your region through environment variables:
```
AWS_REGION=us-west-2
S3_BUCKET=bucket-name
```

## License

[MIT](LICENSE)
