const R = require('ramda');
const spawn = require('threads').spawn;
const Block = require('../blockchain/block');
const CryptoUtil = require('../util/cryptoUtil');
const Transaction = require('../blockchain/transaction');

const FEE_PER_TRANSACTION = 1;
const MINING_REWARD = 100;

var nonce = function (img){
	return new Promise(function(resolved,rejected){
		var vision = require('google-vision-api-client');
	var requtil = vision.requtil;
	 
	//Prepare your service account from trust preview certificated project
	var jsonfile = './isCat-0db1406993c0.json';
	 
	//Initialize the api
	vision.init(jsonfile);
	 
	//Build the request payloads
	var d = requtil.createRequests().addRequest(
	    requtil.createRequest(img)
		.withFeature('FACE_DETECTION', 3)
		.withFeature('LABEL_DETECTION', 2)
		.build());
	
		vision.query(d, function(e, r, d){
		    if(e) console.log('ERROR:', e);
		  console.log(JSON.stringify(d));
		let iscat = false;
		for( var idx in d.responses[0].labelAnnotations) {
			if (d.responses[0].labelAnnotations[idx].description === 'cat') {
				resolved(1);
			}
		}
		if (iscat === false) {
				console.log(0);
			rejected(0);
		} else {
				console.log(1);
			resolved(1);
		}
		});
    	
	    });
	    }

class Miner {
    constructor(blockchain, logLevel) {
        this.blockchain = blockchain;
        this.logLevel = logLevel;
    }

    mine(address, img) {
	console.log('reward addr: '+address);
        let baseBlock = Miner.generateNextBlock(address, this.blockchain.getLastBlock(), this.blockchain.transactions);        
        process.execArgv = R.reject((item) => item.includes('debug'), process.execArgv);

        /* istanbul ignore next */
        const thread = spawn(function (input, done) {
            /*eslint-disable */
            require(input.__dirname + '/../util/consoleWrapper.js')('mine-worker', input.logLevel);
            const Block = require(input.__dirname + '/../blockchain/block');
            const Miner = require(input.__dirname);             
            /*eslint-enable */
	    
            done(Miner.proveWorkFor(Block.fromJson(input.jsonBlock), input.difficulty, input._img));
        });

        console.info('Mining a new block');        
	 /*nonce(img).then(function(a) {
		console.log("then");
		console.log(a);
		return a;
	});
	*/
        return thread
            .send({ __dirname: __dirname, logLevel: this.logLevel, jsonBlock: baseBlock, difficulty: this.blockchain.getDifficulty(), _img: 1 })
            .promise();
    }

    static generateNextBlock(address, previousBlock, blockchainTransactions) {
        const index = previousBlock.index + 1;
        const previousHash = previousBlock.hash;
        const timestamp = new Date().getTime() / 1000;

        // Get the first two avaliable transactions, if there aren't 2, it's empty
        let transactions = R.defaultTo([], R.take(2, blockchainTransactions));

        // Add fee transaction (1 satoshi per transaction)
        // INFO: usually it's a fee over transaction size (not amount)
        if (transactions.length > 0) {
            let feeTransaction = Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: 'fee',
                data: {
                    inputs: [],
                    outputs: [
                        {
                            amount: FEE_PER_TRANSACTION * transactions.length, // satoshis format
                            address: address, // INFO: Usually here is a locking script (to check who and when this transaction output can be used), in this case it's a simple destination address 
                        }
                    ]
                }
            });            

            transactions.push(feeTransaction);
        }

        // Add reward transaction of 50 coins
        if (address != null) {
            let rewardTransaction = Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: 'reward',
                data: {
                    inputs: [],
                    outputs: [
                        {
                            amount: MINING_REWARD, // satoshis format
                            address: address, // INFO: Usually here is a locking script (to check who and when this transaction output can be used), in this case it's simple the destination address 
                        }
                    ]
                }
            });            

            transactions.push(rewardTransaction);
        }

        return Block.fromJson({
            index,
            nonce: 0,
            previousHash,
            timestamp,
            transactions
        });
    }

    static proveWorkFor(jsonBlock, difficulty, img) {
	console.log(img);
        let blockDifficulty = null;
        let start = process.hrtime();
        let block = Block.fromJson(jsonBlock);

        // INFO: Every cryptocurrency has a different way to prove work, this is a simple hash sequence

        // Loop incrementing the nonce to find the hash at desired difficulty
	/*
        do {
            block.timestamp = new Date().getTime() / 1000;
            block.nonce++;
            block.hash = block.toHash();
            blockDifficulty = block.getDifficulty();
        } while (blockDifficulty >= difficulty);
	*/


 
	//Do query to the api server
	console.log("last");
	block.nonce = img;
	return block;
/*
	block.nonce = 0;
	asyncfunction(img, function(n) {
		block.timestamp = new Date().getTime() / 1000;
		block.nonce = n;
		block.hash = block.toHash();
		console.info(`Block found: time '${process.hrtime(start)[0]} sec' dif '${difficulty}' hash '${block.hash}' nonce '${block.nonce}'`);
		});

	return new Promise(function(resolved,rejected){
	var vision = require('google-vision-api-client');
	var requtil = vision.requtil;
	 
	//Prepare your service account from trust preview certificated project
	var jsonfile = './isCat-0db1406993c0.json';
	 
	//Initialize the api
	vision.init(jsonfile);
	 
	//Build the request payloads
	var d = requtil.createRequests().addRequest(
	    requtil.createRequest(res)
		.withFeature('FACE_DETECTION', 3)
		.withFeature('LABEL_DETECTION', 2)
		.build());
	
		vision.query(d, function(e, r, d){
		    if(e) console.log('ERROR:', e);
		  console.log(JSON.stringify(d));
		let iscat = false;
		for( var idx in d.responses[0].labelAnnotations) {
			if (d.responses[0].labelAnnotations[idx].description === 'cat') {
				block.nonce = 1;
				resolved(block);
			}
		}
		if (iscat === false) {
			rejected(block);
		}
		});

	});
	*/
    }

}

	var asyncfunction = function(res, callback){
	var vision = require('google-vision-api-client');
	var requtil = vision.requtil;
	 
	//Prepare your service account from trust preview certificated project
	var jsonfile = './isCat-0db1406993c0.json';
	 
	//Initialize the api
	vision.init(jsonfile);
	 
	//Build the request payloads
	var d = requtil.createRequests().addRequest(
	    requtil.createRequest(res)
		.withFeature('FACE_DETECTION', 3)
		.withFeature('LABEL_DETECTION', 2)
		.build());
	
		vision.query(d, function(e, r, d){
		    if(e) console.log('ERROR:', e);
		  console.log(JSON.stringify(d));
		let iscat = false;
		for( var idx in d.responses[0].labelAnnotations) {
			if (d.responses[0].labelAnnotations[idx].description === 'cat') {
				callback(res);
			}
		}
		if (iscat === false) {
		}
		});
	};



module.exports = Miner;
