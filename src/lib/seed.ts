const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://rtxnqfslyargmuloqrde.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eG5xZnNseWFyZ211bG9xcmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5MjE0MywiZXhwIjoyMDUwMTY4MTQzfQ.CluYOaI-Wnk-97UoHNvoxunKw2Y930fiMvAhfyzA_ps"

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
    try {


        // Create regular users
        const usersData = [
            {
                email: 'user1@example.com',
                password: 'user123',
                full_name: 'Сидоров Сидор Сидорович',
                address: 'ул. Пользовательская, д. 3, кв. 4',
                phone_number: '+375291146913'
            },
            {
                email: 'user2@example.com',
                password: 'user234',
                full_name: 'Николаев Николай Николаевич',
                address: 'ул. Пользовательская, д. 4, кв. 5',
                phone_number: '+375291146914'
            },
            {
                email: 'user3@example.com',
                password: 'user345',
                full_name: 'Михайлов Михаил Михайлович',
                address: 'ул. Пользовательская, д. 5, кв. 6',
                phone_number: '+375291146915'
            },
            {
                email: 'user4@example.com',
                password: 'user456',
                full_name: 'Алексеев Алексей Алексеевич',
                address: 'ул. Пользовательская, д. 6, кв. 7',
                phone_number: '+375291146916'
            },
            {
                email: 'user5@example.com',
                password: 'user567',
                full_name: 'Федоров Федор Федорович',
                address: 'ул. Пользовательская, д. 7, кв. 8',
                phone_number: '+375291146917'
            }
        ];

        const userPromises = usersData.map(async (userData) => {
            const { data: user, error: userError } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: {
                    full_name: userData.full_name,
                    address: userData.address
                }
            });

            if (userError) throw userError;

            console.log('✅ Regular user created:', user);

            return {
                subscriber_id: user.user.id,
                category: '0.5',
                role: 'user',
                raw_user_meta_data: {
                    address: userData.address,
                    full_name: userData.full_name,
                    phone_number: userData.phone_number
                }
            };
        });

        const subscriberProfiles = await Promise.all(userPromises);

        // Insert subscribers_profiles

        console.log('\nDatabase seeded successfully!');
        console.log('\nYou can now log in with:');
        console.log('Admin - email: admin@example.com, password: admin123');
        usersData.forEach(userData => {
            console.log(`User - email: ${userData.email}, password: ${userData.password}`);
        });

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();