const { GymClass, PricePlan, Schedule, PersonalTraining, User } = require('./config/models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // ==================== Seed Admin User ====================
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash('Admin@123', 12);
      await User.create({
        full_name: 'Captain Ahmed Taha',
        email: 'admin@infinitygym.com',
        phone: '01000000000',
        password_hash: passwordHash,
        role: 'admin',
        gender: 'male',
        gym_id: 'GYM-ADMIN',
        referral_code: 'INF-ADMIN',
        is_active: true,
        status: 'active'
      });
      console.log('✅ Admin user seeded: admin@infinitygym.com / Admin@123');
    }

    // ==================== Seed Price Plans ====================
    const priceCount = await PricePlan.count();
    if (priceCount === 0) {
      await PricePlan.bulkCreate([
        { label: '1 Month',   duration_months: 1,  price_male: 500,  price_female: 550,  sort_order: 1 },
        { label: '2 Months',  duration_months: 2,  price_male: 950,  price_female: 950,  sort_order: 2 },
        { label: '3 Months',  duration_months: 3,  price_male: 1050, price_female: 1100, sort_order: 3 },
        { label: '4 Months',  duration_months: 4,  price_male: 1250, price_female: 1300, sort_order: 4 },
        { label: '6 Months',  duration_months: 6,  price_male: 1600, price_female: 1600, sort_order: 5 },
        { label: '1 Year',    duration_months: 12, price_male: 2950, price_female: 2950, sort_order: 6 },
      ]);
      console.log('✅ Price plans seeded.');
    }

    // ==================== Seed Personal Training Plans ====================
    const ptCount = await PersonalTraining.count();
    if (ptCount === 0) {
      await PersonalTraining.bulkCreate([
        { sessions: 8,  price: 350, sort_order: 1 },
        { sessions: 12, price: 400, sort_order: 2 },
        { sessions: 15, price: 450, sort_order: 3 },
      ]);
      console.log('✅ Personal training plans seeded.');
    }

    // ==================== Seed Schedules ====================
    const scheduleCount = await Schedule.count();
    if (scheduleCount === 0) {
      await Schedule.bulkCreate([
        // Women
        { gender: 'female', day_group: 'Saturday - Thursday', time_from: '09:00 AM', time_to: '12:00 PM', label: 'Morning', sort_order: 1 },
        { gender: 'female', day_group: 'Saturday - Thursday', time_from: '05:30 PM', time_to: '09:00 PM', label: 'Evening', sort_order: 2 },
        { gender: 'female', day_group: 'Friday',             time_from: '05:30 PM', time_to: '09:00 PM', label: 'Evening Only', sort_order: 3 },
        // Men
        { gender: 'male', day_group: 'Saturday - Thursday', time_from: '06:00 AM', time_to: '08:00 AM', label: 'Morning', sort_order: 4 },
        { gender: 'male', day_group: 'Saturday - Thursday', time_from: '05:00 PM', time_to: '12:00 AM', label: 'Evening', sort_order: 5 },
        { gender: 'male', day_group: 'Saturday - Thursday', time_from: '09:00 PM', time_to: '01:00 AM', label: 'Night', sort_order: 6 },
        { gender: 'male', day_group: 'Friday',             time_from: '02:00 PM', time_to: '05:30 PM', label: 'Afternoon', sort_order: 7 },
        { gender: 'male', day_group: 'Friday',             time_from: '09:00 PM', time_to: '01:00 AM', label: 'Night', sort_order: 8 },
      ]);
      console.log('✅ Schedules seeded.');
    }

    // ==================== Seed Gym Classes ====================
    const classCount = await GymClass.count();
    if (classCount === 0) {
      await GymClass.bulkCreate([
        { name: 'Cardio',    description: 'Cardiovascular training equipment',    gender: 'both',   icon: '🏃' },
        { name: 'Aerobics',  description: 'Group aerobics classes',                gender: 'female', icon: '💃' },
        { name: 'Spa',       description: 'Relaxation and wellness spa',          gender: 'female', icon: '🧖' },
        { name: 'Sauna',     description: 'Traditional sauna for recovery',       gender: 'female', icon: '🔥' },
        { name: 'Weights',   description: 'Free weights and resistance machines', gender: 'both',   icon: '🏋️' },
        { name: 'CrossFit',  description: 'High-intensity functional training',   gender: 'both',   icon: '⚡' },
        { name: 'Yoga',      description: 'Mind and body yoga sessions',          gender: 'both',   icon: '🧘' },
        { name: 'Boxing',    description: 'Boxing and kickboxing classes',        gender: 'both',   icon: '🥊' },
      ]);
      console.log('✅ Gym classes seeded.');
    }

    console.log('✅ Database seed completed successfully.');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedDatabase;
