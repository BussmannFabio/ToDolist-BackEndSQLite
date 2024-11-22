import request from 'supertest'
import app from '../index.js'

describe('Testando rota /', () => {
    it('Deve retornar "Hello Dev" na rota /', async () => {
        const res = await request(app).get('/')
        expect(res.statusCode).toEqual(200)
        expect(res.body.message).toEqual('Hello Dev')
    })
})

describe('Testando rota GET /users/search', () => {
  
    it('Deve retornar 200 e os resultados da busca', async () => {
      const res = await request(app).get('/users/search')
      
      expect(res.statusCode).toEqual(200)
      expect(Array.isArray(res.body)).toBe(true) 
    })
    
    it('Deve retornar 400 se for especificado id e id_maiorq', async () => {

      const res = await request(app)
        .get('/users/search?id=1&id_maiorq=10')
      
      expect(res.statusCode).toEqual(400)
      expect(res.text).toBe("Impossível buscar por: id e id_maiorq ao mesmo tempo!")

    })

    it('Deve retornar 400 se for especificado id e id_menorq', async () => {

        const res = await request(app)
          .get('/users/search?id=1&id_menorq=10')
        
        expect(res.statusCode).toEqual(400)
        expect(res.text).toBe("Impossível buscar por: id e id_menorq ao mesmo tempo!")
  
      })


    it('Deve retornar 400 se for especificado age e age_menorq', async () => {

        const res = await request(app)
          .get('/users/search?age=1&age_menorq=10')
        
        expect(res.statusCode).toEqual(400)
        expect(res.text).toBe("Impossível buscar por: age e age_menorq ao mesmo tempo!")
  
      })


    it('Deve retornar 400 se for especificado age e age_maiorq', async () => {

        const res = await request(app)
          .get('/users/search?age=1&age_maiorq=10')
        
        expect(res.statusCode).toEqual(400)
        expect(res.text).toBe("Impossível buscar por: age e age_maiorq ao mesmo tempo!")
  
      })
  })