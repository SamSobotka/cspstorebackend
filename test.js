const app = require('./index.js');
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');

describe('Test endpoint responses and database', () => {
    it('gets the test endpoint', async () => {
        const response = await request.get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Backend active');
    });

    it('logs in a user', async () => {
        const response = await request.post('/api/login').send({
            email: 'testuser1@gmail.com',
            password: 'testpass1111'
        });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeTruthy();
    });

    it('returns an error if user does not exist', async () => {
        const response = await request.post('/api/login').send({
            email: 'nonexistentuser@lol.xD',
            password: 'ihatebugs1000'
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
    });

    it('returns an error if password is incorrect', async () => {
        const response = await request.post('/api/login').send({
            email: 'testuser1@gmail.com',
            password: 'wrongpassword'
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
    });

    it('registers a new user and checks the database for the user', async () => {
        const newUser = {
            firstName: 'YetAnother',
            lastName: 'User',
            email: 'testuser3@gmail.com',
            password: 'testpass3333'
        }

        const response = await request.post('/api/register').send(newUser);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');

        // Check the database for the new user
        const User = mongoose.model('User');
        const createdUser = await User.findOne({ email: 'testuser3@gmail.com' });
        expect(createdUser).toBeTruthy();
        expect(createdUser.firstName).toBe(newUser.firstName);
        expect(createdUser.lastName).toBe(newUser.lastName);
    });

    it('returns an error if email is already registered', async () => {
        const response = await request.post('/api/register').send({
            firstName: 'YetAnother',
            lastName: 'User',
            email: 'testuser1@gmail.com',
            password: 'testpass3333'
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already registered');
    });

    it('returns an error if email is not provided', async () => {
        const response = await request.post('/api/register').send({
            firstName: 'YetAnother',
            lastName: 'User',
            password: 'testpass3333'
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email is required');
    });

    it('deletes a user and ensures the user no longer exists in the database', async () => {
        const emailData = { email: 'testuser3@gmail.com' }

        const response = await request.post('/api/delete').send(emailData);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');

        // Check the database for the deleted user
        const User = mongoose.model('User');
        const deletedUser = await User.findOne({ email: 'testuser3@gmail.com' });
        expect(deletedUser).toBeFalsy();
    });

    it('returns an error if user does not exist (deletion)', async () => {
        const response = await request.post('/api/delete').send({
            email: 'idon\'texist@oof.feelsbadman'
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User not found');
    });
});