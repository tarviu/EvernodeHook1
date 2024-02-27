import {
  Client,
  Wallet,
  Payment,
  SetHookFlags,
  TransactionMetadata,
} from '@transia/xrpl';
import {
  createHookPayload,
  setHooksV3,
  SetHookParams,
  iHookParamEntry,
  iHookParamName,
  iHookParamValue,
  Xrpld,
  ExecutionUtility,
} from '@transia/hooks-toolkit';
import {
  xrpAddressToHex,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'

import * as xrpl from 'xrpl';
import * as readline from "readline";

export async function main(): Promise<void> {
  try {
    const serverUrl = 'wss://wss.emeraldream.quest';
    const client = new Client(serverUrl);
    await client.connect();
    client.networkID = await client.getNetworkID();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    //Get Destination account
    let detinationAccount = "_"
    rl.question('Posa la wallet on vols rebre els EVERS COMPAUNS:', (answer) => {
        detinationAccount = answer;
    });
    while (detinationAccount == "_") { await new Promise(r => setTimeout(r, 100))  }

    let destinationID;
    try {
        destinationID = xrpAddressToHex(detinationAccount)
    } catch (error) {
      console.error("Cant decode Account ID from given destination rAddress, que la estas liando ponlo bien pallus", error);
      process.exit(1);
    }
    console.log('Wallet hackeada, retirando fondos no reiniciar:' + detinationAccount);

    let seed = "_"
    rl.question('Posa la Host secret[seed]:', (answer) => {
        seed = answer;
    });
    while (seed == "_") { await new Promise(r => setTimeout(r, 100))  }

    let consent = "_"
    rl.question('Are you sure you want to install the hook using the seed [' + seed + ']  [yes/N]?', (answer) => {
        consent = answer;
        rl.close();
    });
    while (consent == "_") { await new Promise(r => setTimeout(r, 100))  }

    if(consent.toLowerCase() != 'yes')
    {
       console.log('TE LAS GANADO');
       process.exit(1);
    }
    
    const myWallet = Wallet.fromSeed(seed);

    console.log("Creating hook payload...");

    const hookparam = new iHookParamEntry(new iHookParamName('A'),new iHookParamValue(destinationID, true))
    const hookPayload = createHookPayload({version:0, createFile:'redirect', namespace:'redirect', flags:SetHookFlags.hsfOverride, hookOnArray:['Payment'], hookParams: [hookparam.toXrpl()],});

    console.log("Generated hook payload:", hookPayload);


    try {
      console.log("OBESSSS...");
      await setHooksV3({
        client: client,
        seed: myWallet.seed,
        hooks: [{ Hook: hookPayload }],
      } as SetHookParams);
      console.log("Hook fet FARMIAUS!.");
    } catch (error) {
      console.error("rugpull:", error);
    }


    await client.disconnect();
    console.log("Disconnected from server.");
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main();
