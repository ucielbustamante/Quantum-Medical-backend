const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('./config/passport.config');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(passport.initialize());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hola mundo' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

module.exports = app;