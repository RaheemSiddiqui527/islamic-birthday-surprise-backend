import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/database.js';
import { AdminUser } from '../models/AdminUser.js';
import { config } from '../config/index.js';

async function seedAdminCLI() {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const username = args[0] || config.initialAdmin.username;
    const password = args[1] || config.initialAdmin.password;

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const existing = await AdminUser.findOne({ username });
    if (existing) {
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log(`[Admin CLI] Password updated for existing administrator: "${username}"`);
    } else {
      await AdminUser.create({
        username,
        passwordHash,
        role: 'superadmin'
      });
      console.log(`[Admin CLI] New administrator created: username="${username}"`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Admin CLI] Error creating admin:', err.message);
    process.exit(1);
  }
}

seedAdminCLI();
