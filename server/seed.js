const { sequelize, PricePlan, GymClass, Schedule, PersonalTraining } = require('./config/models');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync(); // Ensure tables are created

    // Seed Price Plans
    const pricePlans = [
      { label: '1 Month', duration_months: 1, price_male: 500, price_female: 550, sort_order: 1 },
      { label: '2 Months', duration_months: 2, price_male: 950, price_female: 950, sort_order: 2 },
      { label: '3 Months', duration_months: 3, price_male: 1050, price_female: 1100, sort_order: 3 },
      { label: '4 Months', duration_months: 4, price_male: 1250, price_female: 1300, sort_order: 4 },
      { label: '6 Months', duration_months: 6, price_male: 1600, price_female: 1600, sort_order: 5 },
      { label: '1 Year', duration_months: 12, price_male: 2950, price_female: 2950, sort_order: 6 }
    ];

    for (const plan of pricePlans) {
      await PricePlan.findOrCreate({ where: { label: plan.label }, defaults: plan });
    }

    // Seed Personal Training
    const ptPlans = [
      { sessions: 8, price: 350, sort_order: 1 },
      { sessions: 12, price: 400, sort_order: 2 },
      { sessions: 15, price: 450, sort_order: 3 }
    ];

    for (const pt of ptPlans) {
      await PersonalTraining.findOrCreate({ where: { sessions: pt.sessions }, defaults: pt });
    }

    // Seed Schedules
    const schedules = [
      { gender: 'female', day_group: 'Saturday to Thursday', time_from: '09:00 AM', time_to: '12:00 PM', label: 'Morning', sort_order: 1 },
      { gender: 'female', day_group: 'Saturday to Thursday', time_from: '05:30 PM', time_to: '09:00 PM', label: 'Evening', sort_order: 2 },
      { gender: 'female', day_group: 'Friday', time_from: '05:30 PM', time_to: '09:00 PM', label: 'Evening', sort_order: 3 },
      { gender: 'male', day_group: 'Saturday to Thursday', time_from: '06:00 AM', time_to: '08:00 AM', label: 'Morning', sort_order: 4 },
      { gender: 'male', day_group: 'Saturday to Thursday', time_from: '05:00 PM', time_to: '12:00 AM', label: 'Evening', sort_order: 5 },
      { gender: 'male', day_group: 'Saturday to Thursday', time_from: '09:00 PM', time_to: '01:00 AM', label: 'Night', sort_order: 6 },
      { gender: 'male', day_group: 'Friday', time_from: '02:00 PM', time_to: '05:30 PM', label: 'Afternoon', sort_order: 7 },
      { gender: 'male', day_group: 'Friday', time_from: '09:00 PM', time_to: '01:00 AM', label: 'Night', sort_order: 8 }
    ];

    for (const sch of schedules) {
      await Schedule.findOrCreate({ where: { day_group: sch.day_group, gender: sch.gender, time_from: sch.time_from }, defaults: sch });
    }

    // Seed Gym Classes
    const classes = [
      { name: 'Cardio', description: 'Burn calories and improve heart health', sort_order: 1 },
      { name: 'Aerobics', description: 'High-energy rhythmic exercises', sort_order: 2 },
      { name: 'Spa & Sauna', description: 'Relaxation and muscle recovery', sort_order: 3 },
      { name: 'Zumba', description: 'Fun dance workout', sort_order: 4 },
      { name: 'Weight Lifting', description: 'Build muscle mass and strength', sort_order: 5 }
    ];

    for (const cls of classes) {
      await GymClass.findOrCreate({ where: { name: cls.name }, defaults: cls });
    }

    console.log('Database seeded successfully with dynamic data.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

seedDatabase();
