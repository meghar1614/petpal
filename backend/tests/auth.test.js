require('./setup');
const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

describe('Auth flow', () => {
  test('signup -> login -> me', async () => {
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Ada', email: 'ada@example.com', password: 'hunter12' });
    expect(signup.status).toBe(201);
    expect(signup.body.token).toBeDefined();
    expect(signup.body.user.email).toBe('ada@example.com');
    expect(signup.body.user.password).toBeUndefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'hunter12' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('ada@example.com');
  });

  test('rejects wrong password', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Bo', email: 'bo@example.com', password: 'rightpass' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bo@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Cy', email: 'cy@example.com', password: 'password1' });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Cy2', email: 'cy@example.com', password: 'password2' });
    expect(res.status).toBe(409);
  });

  test('rejects /me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
