import supertest from 'supertest'
import app from '../index.js'

describe('Testando rotas do Express', () => {
    it('Deve retornar "Hello Dev" na rota /', async () => {
        const res = await request(app).get('/')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('message', 'Hello Dev')
    })
})