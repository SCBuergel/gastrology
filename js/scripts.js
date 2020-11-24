// based on https://ethereum.stackexchange.com/a/24238
const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }

      resolve(res);
    })
  );

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

// from https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/median.md
const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const average = list => list.reduce((prev, curr) => prev + curr) / list.length;

const proxiedWeb3 = new Proxy(web3, proxiedWeb3Handler);
let numBlocks = 10;
let txs = new Map();

async function loadBlocks() {
	/*
	 * 1. load blocks
	 * 2. load txs
	 * 3. get gas prices per tx
	 * 4. calculate, median, mean, min, max, 10th highest, 10th lowest gas price per block
	 * 5. render
	 */
	let blockNumber = await proxiedWeb3.eth.getBlockNumber();
	var table = document.getElementById("gasTable");
	for (let blockNo = blockNumber; blockNo > blockNumber - numBlocks; blockNo--) {
		let block = await proxiedWeb3.eth.getBlock(blockNo);
	  let blockTxs = [];

		// reading txs in sequence
		/*
		for (let txIndex = 0; txIndex < block.transactions.length; txIndex++) {
			let tx = block.transactions[txIndex];
			console.log("Getting transaction " + tx);
		  txs.push(await proxiedWeb3.eth.getTransaction(tx));
		}
		*/

		// reading txs in parallel
		await Promise.all(block.transactions.map(async (tx) => {
			// console.log("Getting transaction " + tx);
      blockTxs.push((await proxiedWeb3.eth.getTransaction(tx)).gasPrice.toNumber()/1e9);
		}));
		blockTxs.sort();
		let 10highestGas = blockTxs.length > 20 ? blockTxs[9] : "-";
		let minGas = blockTxs.length > 0 ? Math.min(...blockTxs) : "-";
		let medianGas = blockTxs.length > 0 ? median(blockTxs) : "-";
		let averageGas = blockTxs.length > 0 ? average(blockTxs) : "-";
		blockTxs.reverse();
		let 10lowestGas = blockTxs.length > 20 ? blockTxs[9] : "-";
		let maxGas = blockTxs.length > 0 ? Math.max(...blockTxs) : "-";

		console.log("RESULT: " + blockNo + " (" + blockTxs.length + " txs): " + minGas + ", " + medianGas + ", " + averageGas + ", " + maxGas);
		var row = table.insertRow();
		var cell0 = row.insertCell(0);
		var cell1 = row.insertCell(1);
		var cell2 = row.insertCell(2);
		var cell3 = row.insertCell(3);
		var cell4 = row.insertCell(4);
		var cell5 = row.insertCell(5);
		var cell6 = row.insertCell(6);
		var cell7 = row.insertCell(7);
		cell0.innerHTML = blockNo;
		cell1.innerHTML = blockTxs.length;
		cell2.innerHTML = minGas.toFixed(2);
		cell3.innerHTML = 10lowest.toFixed(2);
		cell4.innerHTML = medianGas.toFixed(2);
		cell5.innerHTML = averageGas.toFixed(2);
		cell6.innerHTML = 10highestGas.toFixed(2);
		cell7.innerHTML = maxGas.toFixed(2);
		txs.set(blockNo, blockTxs);
	}

  var myDiv = document.createElement("div");
  myDiv.innerText = "Latest block: " + blockNumber;
  document.body.appendChild(myDiv);
}

window.onload = function() {
	loadBlocks().then();
}
