# CRM System

A modern Customer Relationship Management system built with React, Supabase, and AWS Amplify.

## Features

- **User Management**
  - Multiple user roles (Admin, Employee, Customer)
  - Authentication and authorization
  - User profiles and settings

- **Ticket Management**
  - Create and manage support tickets
  - Ticket assignments and tracking
  - Priority and status management
  - File attachments

- **Communication**
  - Real-time ticket updates
  - Email notifications
  - Internal notes and comments

- **Reporting**
  - Performance metrics
  - Customer satisfaction tracking
  - Ticket analytics

## Tech Stack

- **Frontend**
  - React
  - TypeScript
  - Material-UI
  - React Query
  - Zustand

- **Backend**
  - Supabase
  - Node.js
  - Express
  - TypeScript

- **Infrastructure**
  - AWS Amplify
  - Supabase
  - AWS S3 (file storage)
  - AWS SES (email)

## Project Structure

```
packages/
├── frontend/        # React frontend application
├── backend/         # Express backend server
└── shared/          # Shared types and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- AWS account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/crm-system.git
   cd crm-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables

4. Start the development servers:
   ```bash
   # Start all packages in development mode
   npm run dev
   ```

### Development

- Frontend: http://localhost:3001
- Backend: http://localhost:3000

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@yourcompany.com or open an issue in the repository.
