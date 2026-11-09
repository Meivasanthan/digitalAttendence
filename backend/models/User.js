const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['staff', 'student'], required: true },
  name: { type: String, required: true },
  department: String,
  year: String,
  section: String,
  regNo: { type: String, unique: true, sparse: true },
  staffId: { type: String, unique: true, sparse: true },
  photo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Remove the pre-save hook that hashes passwords
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// Modify the password check method to compare plain text
userSchema.methods.correctPassword = async function(candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model('User', userSchema);