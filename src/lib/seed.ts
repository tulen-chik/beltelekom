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
                role: 'admin',
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