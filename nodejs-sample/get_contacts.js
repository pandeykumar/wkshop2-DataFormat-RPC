const client = require('./client')
console.log('client', client)
client.list({}, (error, contacts) => {
    if (!error) {
        console.log('successfully fetch List of contacts')
        console.log(contacts)
    } else {
        console.error('Some error !!!')
        console.error(error)
    }
})
