require('./setup');
const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

async function seedUserAndPet() {
  const signup = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'O', email: 'owner2@example.com', password: 'password1' });
  const token = signup.body.token;
  const pet = await request(app)
    .post('/api/pets')
    .set({ Authorization: `Bearer ${token}` })
    .send({ name: 'Max', species: 'dog' });
  return { token, petId: pet.body._id };
}

describe('CareActivity CRUD', () => {
  test('full CRUD lifecycle for an activity', async () => {
    const { token, petId } = await seedUserAndPet();
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app)
      .post('/api/activities')
      .set(auth)
      .send({ pet: petId, type: 'walk', title: 'Morning walk' });
    expect(created.status).toBe(201);
    const id = created.body._id;

    const list = await request(app).get('/api/activities').set(auth);
    expect(list.body).toHaveLength(1);

    const one = await request(app).get(`/api/activities/${id}`).set(auth);
    expect(one.body.title).toBe('Morning walk');

    const updated = await request(app)
      .put(`/api/activities/${id}`)
      .set(auth)
      .send({ completed: true });
    expect(updated.body.completed).toBe(true);

    const del = await request(app).delete(`/api/activities/${id}`).set(auth);
    expect(del.status).toBe(200);

    const after = await request(app).get('/api/activities').set(auth);
    expect(after.body).toHaveLength(0);
  });

  test('blocks activity creation for a pet the user does not own', async () => {
    const { token: tokenA } = await seedUserAndPet();

    const signupB = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'B', email: 'b2@example.com', password: 'password1' });
    const petB = await request(app)
      .post('/api/pets')
      .set({ Authorization: `Bearer ${signupB.body.token}` })
      .send({ name: 'Other', species: 'cat' });

    const res = await request(app)
      .post('/api/activities')
      .set({ Authorization: `Bearer ${tokenA}` })
      .send({ pet: petB.body._id, type: 'feeding', title: 'Steal food' });
    expect(res.status).toBe(404);
  });

  test('filters activities by petId', async () => {
    const { token, petId } = await seedUserAndPet();
    const auth = { Authorization: `Bearer ${token}` };

    const pet2 = await request(app)
      .post('/api/pets')
      .set(auth)
      .send({ name: 'Whiskers', species: 'cat' });

    await request(app).post('/api/activities').set(auth).send({ pet: petId, type: 'walk', title: 'A' });
    await request(app).post('/api/activities').set(auth).send({ pet: pet2.body._id, type: 'feeding', title: 'B' });

    const res = await request(app).get(`/api/activities?petId=${petId}`).set(auth);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('A');
  });
});
