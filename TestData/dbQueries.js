var queries=function(){
    this.wrongEmail=`SELECT firstname FROM users limit 10`;
    this.password=``
}
module.exports = new queries();
