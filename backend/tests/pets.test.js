require('./setup');
const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

async function signupAndToken(email = 'owner@example.com') {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Owner', email, password: 'password1' });
  return res.body.token;
}

describe('Pet CRUD', () => {
  test('full CRUD lifecycle for a pet', async () => {
    const token = await signupAndToken();
    const auth = { Authorization: `Bearer ${token}` };

    // create
    const created = await request(app)
      .post('/api/pets')
      .set(auth)
      .send({ name: 'Biscuit', species: 'dog', breed: 'Corgi' });
    expect(created.status).toBe(201);
    const petId = created.body._id;

    // list
    const list = await request(app).get('/api/pets').set(auth);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    // get by id
    const one = await request(app).get(`/api/pets/${petId}`).set(auth);
    expect(one.status).toBe(200);
    expect(one.body.name).toBe('Biscuit');

    // update
    const updated = await request(app)
      .put(`/api/pets/${petId}`)
      .set(auth)
      .send({ name: 'Biscuit Jr.' });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Biscuit Jr.');

    // delete
    const deleted = await request(app).delete(`/api/pets/${petId}`).set(auth);
    expect(deleted.status).toBe(200);

    const after = await request(app).get('/api/pets').set(auth);
    expect(after.body).toHaveLength(0);
  });

  test('owner isolation: user A cannot see user B pets', async () => {
    const tokenA = await signupAndToken('a@example.com');
    const tokenB = await signupAndToken('b@example.com');

    const petB = await request(app)
      .post('/api/pets')
      .set({ Authorization: `Bearer ${tokenB}` })
      .send({ name: 'Nemo', species: 'fish' });
    expect(petB.status).toBe(201);

    const listA = await request(app)
      .get('/api/pets')
      .set({ Authorization: `Bearer ${tokenA}` });
    expect(listA.body).toHaveLength(0);

    const getByA = await request(app)
      .get(`/api/pets/${petB.body._id}`)
      .set({ Authorization: `Bearer ${tokenA}` });
    expect(getByA.status).toBe(404);
  });
});
