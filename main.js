const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const rpcEndpoint = 'https://wax.greymass.com'

const wax = new waxjs.WaxJS({
    rpcEndpoint: rpcEndpoint,
});

async function main() {
    console.log('Connected', rpcEndpoint)

    window.opener.postMessage({
        type: 'ready'
    })

    window.addEventListener('message', async (event) => {        
        if (event.data.type === 'login') {
            console.log('login message', event.data)

            let accountName = null;

            while (!accountName) {
                try {
                    accountName = await wax.login();
                } catch (err) {
                    console.log('Login error', err)
                    await sleep(5000)
                }
            }

            console.log('Logged in', accountName)

            window.opener.postMessage({
                type: 'loginSuccess',
                accountName: accountName
            })

            window.close();
        } else if (event.data.type === 'transaction') {
            console.log('transaction message', event.data)

            let transactionId = null;

            while (!transactionId) {
                try {
                    const spinAction = {
                        account: event.data.contract,
                        name: event.data.action,
                        authorization: [{
                            actor: wax.userAccount,
                            permission: 'active'
                        }],
                        data: event.data.data
                    }

                    console.log("spinAction", spinAction)

                    transactionId = await wax.api.transact({
                        actions: [
                            spinAction
                        ]
                    }, {
                        blocksBehind: 3,
                        expireSeconds: 30
                    });
                } catch (err) {
                    console.log('Transaction error', err);
                    await sleep(5000);
                }
            }

            window.opener.postMessage({
                type: 'transactionSuccess',
                transactionId: transactionId
            })

            window.close();        
        }
    })
}

main()