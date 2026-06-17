CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

INSERT INTO documents (title, content, metadata) VALUES
  ('How to Enroll', 'To enroll: Browse courses, click Enroll, select plan, complete payment, access immediately.', '{"category": "getting-started"}'::jsonb),
  ('Course Features', 'Includes: videos, resources, quizzes, projects, forums, lifetime access, certificates.', '{"category": "features"}'::jsonb),
  ('Payment Methods', 'Accept: credit cards, debit cards, UPI, net banking, wallets. All secure.', '{"category": "payments"}'::jsonb),
  ('Refund Policy', '7-day money-back guarantee if not satisfied.', '{"category": "policies"}'::jsonb),
  ('Technical Requirements', 'Need: internet 2+ Mbps, modern browser, 2GB RAM, 500MB storage.', '{"category": "technical"}'::jsonb),
  ('Certificates', 'Digital certificates shareable on LinkedIn upon completion.', '{"category": "certification"}'::jsonb),
  ('Password Reset', 'Click Forgot Password, enter email, follow reset link, create new password.', '{"category": "account"}'::jsonb),
  ('Course Access', 'Access from Dashboard anytime with videos, PDFs, quizzes, projects, forums.', '{"category": "learning"}'::jsonb),
  ('Support', 'Live chat 9 AM-6 PM IST, email support@studynotion.com, forums.', '{"category": "support"}'::jsonb),
  ('Progress Tracking', 'Track completion, watched lectures, quiz scores in Dashboard.', '{"category": "learning"}'::jsonb)
  ON CONFLICT DO NOTHING;

SELECT COUNT(*) as documents_count FROM documents;
