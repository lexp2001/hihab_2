const chai = require('chai');
chaiHttp = require('chai-http')
const { app } = require('../../app');
const { buildings } = require('../../routes/buildings');

// Configure chai
chai.use(chaiHttp);
chai.should();
describe("Hi:Hab Testing", () => {
/*
    describe("Normalizing Address", () => {

        it("WHEN sends the building address EXPECT return a normalized address", 
          (done) => {

            var send = {
                "direccion": "Calzáda Legaria, Loñas  HÉrÑosa,  585",
                "relacion": {
                "tipo": "Propietario",
                "nombre": "Franz",
                "apellido": "Schubert",
                "tlf": "+52 (23)1243-3434",
                "email":"franzschubert@fm.com"
                }
            };

             chai.request("http://local.hihab.epicaai.tk")
                 .post('/buildings/search')
                 .send(send)
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                     res.body.test.direccion.should.to.
                        equal("CALZADA LEGARIA LONAS HERNOSA 585");
                     res.body.test.numArray.should.be.an('array').that.
                        include("585");
                     res.body.test.keyArray.should.be.an('array').that.
                        include("LEGARIA");
                     done();
                  });
         });
    });
*/
    describe("Search's Filters", () => {

        it("WHEN address doesn't have numbers EXPECT a without number error message", 
        (done) => {

            var send = {
                "direccion": "Cualquier dirección sin número",
                "relacion": {
                "tipo": "Propietario",
                "nombre": "Franz",
                "apellido": "Schubert",
                "tlf": "+52 (23)1243-3434",
                "email":"franzschubert@fm.com"
                }
            };

            chai.request("http://local.hihab.epicaai.tk")
                .post('/buildings/search')
                .send(send)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.errorMsg.should.be.
                    equal("Without number");
                    done();
                });
        });

        it("WHEN address doesn't have at least 2 words EXPECT a Too short error message", 
        (done) => {

            var send = {
                "direccion": "es corta, 234",
                "relacion": {
                "tipo": "Propietario",
                "nombre": "Franz",
                "apellido": "Schubert",
                "tlf": "+52 (23)1243-3434",
                "email":"franzschubert@fm.com"
                }
            };

            chai.request("http://local.hihab.epicaai.tk")
                .post('/buildings/search')
                .send(send)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.errorMsg.should.be.
                    equal("Too short");
                    done();
                });
        });
/*
        it("WHEN address numbers don't match with any \"no_externo\" EXPECT a "+
           "\"Address doesn't exist\" error message", 
        (done) => {

            var send = {
                "direccion": "Calzáda la Legaria 585",
                "relacion": {
                "tipo": "Propietario",
                "nombre": "Franz",
                "apellido": "Schubert",
                "tlf": "+52 (23)1243-3434",
                "email":"franzschubert@fm.com"
                }
            };

            chai.request("http://local.hihab.epicaai.tk")
                .post('/buildings/search')
                .send(send)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.errorMsg.should.be.
                    equal("Address doesn't exist");
                    done();
                });
        });

*/
    });
});
