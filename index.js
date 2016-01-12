var path = require( 'path' );
var crypto = require( 'crypto' );
var mime = require( 'mime-types' );
var AWS = require( 'aws-sdk' );

function getFilename( req, file, cb ) {

	crypto.pseudoRandomBytes( 16, function ( err, raw ) {

		cb( err, err ? undefined : raw.toString( 'hex' ) );

	});

}

function getDestination( req, file, cb ) {

	cb( null, '' );

}

function S3Storage( opts ) {

	this.getFilename = ( opts.filename || getFilename );

	if ( 'string' === typeof opts.destination ) {

		this.getDestination = function( $0, $1, cb ) { cb( null, opts.destination ); }

	} else {

		this.getDestination = ( opts.destination || getDestination );

	}

	opts.region = ( opts.region || process.env.AWS_REGION || 'us-west-2' );
	opts.bucket = ( opts.bucket || process.env.S3_BUCKET || null );

	if ( ! opts.bucket ) {

		throw new Error( 'You have to specify bucket for S3 Storage to work.' );

	}

	AWS.config.region = opts.region;

	this.s3obj = new AWS.S3({
		params: {
			Bucket: opts.bucket
		}
	});

	this.options = opts;

}

S3Storage.prototype._handleFile = function _handleFile( req, file, cb ) {

	var self = this

	self.getDestination( req, file, function( err, destination ) {

		if ( err ) {

			return cb( err );

		}

		self.getFilename( req, file, function( err, filename ) {

			if ( err ) {

				return cb( err );

			}

			var finalPath = path.join( destination, filename ),
				size,
				contentType = mime.lookup( finalPath ),
				params = {
					Key : finalPath,
					Body: file.stream
				};

			if ( contentType ) {
				
				params.ContentType = contentType;
				
			}

			self.s3obj
				.upload( params )
				.on( 'httpUploadProgress', function( info ){

					if ( info.total ) {

						size = info.total;

					}

				})
				.send( function( err, data ) {

					if ( err ) {

						cb( err, data );

					} else {

						cb( null, {
							destination: destination,
							filename   : filename,
							path       : finalPath,
							size       : size,
							s3         : {
								ETag    : data.ETag,
								Location: data.Location
							}
						});

					}

				});

		});

	});

};
	
S3Storage.prototype._removeFile = function _removeFile( req, file, cb ) {
	
	this.s3obj.deleteObject({
		Bucket: this.options.bucket,
		Key   : file.path
	}, cb );

};

module.exports = function( opts ) {

	return new S3Storage( opts );

};