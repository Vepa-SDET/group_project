var queries=function(){
    this.wrongEmail=`SELECT firstname FROM users limit 10`;
    this.password=``
    this.jamesMayEmail=`SELECT email FROM users WHERE firstname = 'James' AND lastname = 'May'`
    this.jamesMayPassword=`SELECT lower(firstname || lastname) AS password FROM users WHERE firstname = 'James' AND lastname = 'May'`
}
module.exports = new queries();
