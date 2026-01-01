
import bcrypt from 'bcryptjs';

async function gen() {
    const hash = await bcrypt.hash('password', 10);
    console.log('Hash for "password":', hash);
}

gen();
