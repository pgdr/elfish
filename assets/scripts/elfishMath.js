/**
 * Computes the catchability q = 1-p.
 *
 */
function catchability (arr) {
    window.elfish.unstable = false;
    // k = number of removals
    var k = arr.length;
    
    // TOTAL CATCH
    var totalCatch = sum(arr);
    
    var summand = 0.0;
    for (var i = 1; i < k; i++) {
        summand += (i * arr[i]);
    }
    summand = summand / totalCatch;
    
    // c_0 / T can be used as first guess
    var q = 1 - (arr[0] / totalCatch);
    
    // console.log("init q = " + q);
    
    var sumtwo = (k* Math.pow(q,k)) / (1 - Math.pow(q,k));
    var qinv = 1 - q;
    q = (summand + sumtwo) * qinv;
    // console.log("q = " + q);
    
    for (var i = 0; i < 100; i++) {
	    var oldq=q;
	    sumtwo = (k* Math.pow(q,k)) / (1 - Math.pow(q,k));
	    qinv = 1 - q;
	    q = (summand + sumtwo) * qinv;
	    // console.log("q" + i + " = " + q);
	    if (Math.abs(oldq-q) < 0.00001) {
	        return q;
	    }
    }
    // console.log("Unstable q");
    window.elfish.unstable = true;    
    return q;
}



/**
 * Zippin estimate of N hat of catches given in array arr.
 *
 *
 * Computes T / (1 - q^k)
 * where T = totalCatch (BB4)
 * k = num catch (AG4)
 * q = (1-p) (BV4)
 */
function estimate (arr) {
    // k = number of removals
    var k = arr.length;
    
    // TOTAL CATCH
    var totalCatch = sum(arr);
    
    var q = catchability(arr);
    return totalCatch / (1-Math.pow(q,k));
}



/**
 * Computes confidence interval.  If no area is given, assumes 100.
 */
function confidence (arr, area) {
    if (typeof area === "undefined") {
	    area = 100;
    }
    
    
    // k = number of removals
    var k = arr.length;
    
    // TOTAL CATCH
    var totalCatch = sum(arr);
    
    var q = catchability(arr);
    
    var qk = Math.pow(q,k);
    
    var CR4 = totalCatch / (1-Math.pow(q,k));
    
    // console.log("CR4 = " + CR4);
    
    // CR4 * (1-(BV4^$AG4)) * BV4^$AG4
    var CS4numerator = CR4 * (1-qk) * qk;
    
    // (((1-(qk))^2)-(Math.pow((1-q)*k,2))*(Math.pow(q,k-1)))
    var CS4denominator = (Math.pow(1-qk,2) - (Math.pow((1-q)*k,2)*(Math.pow(q,k-1))));
    
    var CS4 = CS4numerator / CS4denominator;
    // console.log("CS4 = " + CS4);
    
    var CT4 = Math.sqrt(CS4);
    
    // console.log("CT4 = " + CT4);
    
    var CU4 = 1.96 * CT4;
    
    // console.log("CU4 = " + CU4);
    
    return CU4/area * 100;
}

/**
 * Gets string 200 &pm; 59*
 */
function getEstimateString(arr) {
    if (arr.length < 2) {
	    return "---";
    }
    
    var q = estimate(arr);
    var cf = confidence(arr, 100);
    var unstable = "";
    if (window.elfish.unstable) {
	    window.elfish.unstable = false;
	    unstable = "*";
    }
    
    return q.toFixed(2) + " &pm; " + cf.toFixed(2) + unstable;
}

/**
 * Returns k/E
 *
 */
function getKE(arr) {
    if (arr.length < 2) {
	    return "---";
    }
    
    // todo precomputed
    var q = estimate(arr);
    var cf = confidence(arr, 100);
    var unstable = "";
    if (window.elfish.unstable) {
	    window.elfish.unstable = false;
	    unstable = "*";
    }
    
    return (cf/q).toFixed(2);
}

function getTE(arr) {
    if (arr.length < 2) {
	    return "---";
    }
    
    var t = sum(arr);
    
    // todo precomputed
    var q = estimate(arr);
    var cf = confidence(arr, 100);
    var unstable = "";
    if (window.elfish.unstable) {
	    window.elfish.unstable = false;
	    unstable = "*";
    }
    
    return (t/q).toFixed(2);
}


/**
 * Returns the sum of the values in arr.
 */
function sum(arr) {
    var t = 0;
    for (var i = 0; i < arr.length; i++) {
	    t += arr[i];
    }
    return t;
}



function carleAndStrub(arr, guess) {
    // zippin is probably good guess
    if (typeof guess == "undefined") {
        guess = estimate(arr);
    }
    
    
    var k = arr.length;
    
    console.log("k = " + k);
    
    var totalCatch = sum(arr);
    
    console.log("T = " + totalCatch);
    
    // linCatch is linearly increasing sum over catches (see loop)
    var linCatch = 0.0;
    for (var j = 0; j < arr.length; j++) {
        linCatch += arr[j] * (k-(j+1));
    }
    
    console.log("Σ (k-i)C_i = " + linCatch);
    
    var prod = 1.0;
    for (var i = 1; i <= k; i++) {
        var numerator   = (k * guess) - linCatch - totalCatch + 1.0 + k - i;
        var denominator = (k * guess) - linCatch + 2.0 + k - i;
        prod = prod * (numerator / denominator);
        console.log("\tnum = " + numerator.toFixed(2));
        console.log("\tden = " + denominator.toFixed(2));
        console.log("\tit " + i + " prod = " + prod.toFixed(2));
    }
    
    var prodIntoEstimate = prod * (guess + 1.0);
    
    var carNStrub = (totalCatch - 1.0) * prodIntoEstimate;
    
    // N hat >= carNStrub
    
    return carNStrub;
}
