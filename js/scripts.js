// based on https://ethereum.stackexchange.com/a/24238

const proxiedWeb3Handler = {
  get: (target, name) => {              
    const inner = target[name];                            
    if (inner instanceof Function) {                       
      return (...args) => promisify(cb => inner(...args, cb));                                                         
    } else if (typeof inner === 'object') {                
      return new Proxy(inner, proxiedWeb3Handler);
    } else {
      return inner;
    }
  },
};

window.onload = function() {
	let blockNumber = await proxiedWeb3.eth.getBlockNumber();
	let numBlocks = 2;
	let txs = [];
	for (let blockNo = blockNumber; blockNo > blockNumber - numBlocks; blockNo--) {
		let block = await proxiedWeb3.eth.getBlock(block);
		block.transactions.foreach((tx, index) => {
			console.log("Getting transaction " + tx);
		  txs.push(await proxiedWeb3.eth.getTransaction(tx));
		}
	}
  var myDiv = document.createElement("div");
  myDiv.innerText = "Latest block: " + blockNumber;
  document.body.appendChild(myDiv);
}
