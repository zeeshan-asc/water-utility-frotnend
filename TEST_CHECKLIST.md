# Financial Health Component - Test Checklist

## ✅ Code Quality Checks

### 1. Linting
- [x] No ESLint errors
- [x] All imports are valid
- [x] React hooks used correctly

### 2. Component Structure
- [x] All state variables defined
- [x] useEffect hooks properly configured
- [x] Event handlers defined
- [x] Form submission handler exists

## 🔌 API Integration Tests

### Dashboard Endpoints (8/8)
- [x] `GET /api/v0/dashboard/kpis` - Integrated
- [x] `GET /api/v0/dashboard/revenue/summary` - Integrated
- [x] `GET /api/v0/dashboard/revenue/trends` - Integrated
- [x] `GET /api/v0/dashboard/budget-variance` - Integrated
- [x] `GET /api/v0/dashboard/ar-aging` - Integrated
- [x] `GET /api/v0/dashboard/debt` - Integrated
- [x] `GET /api/v0/dashboard/alerts` - Integrated
- [x] `GET /api/v0/dashboard/scenarios` - Integrated

### AI/ML Endpoints (2/4)
- [x] `POST /api/v0/ai/ask` - Integrated (Chatbot)
- [x] `GET /api/v0/ai/health` - Integrated (Health Check)
- [ ] `GET /api/v0/ai/generate-sql` - Not used (optional)
- [ ] `POST /api/v0/ai/run-sql` - Not used (optional)

### Utility Endpoints (1/2)
- [x] `GET /health` - Integrated (Backend Health Check)
- [ ] `GET /` - Not used (optional API info)

## 🧪 Functionality Tests

### Chatbot Form Submission
1. **Form Structure**
   - [x] Form element has `onSubmit={handleAIQuestionSubmit}`
   - [x] Input field is controlled (`value={aiQuestion}`)
   - [x] Button is type="submit"
   - [x] Enter key support added

2. **Submission Handler**
   - [x] `handleAIQuestionSubmit` function exists
   - [x] Prevents default form behavior
   - [x] Validates question is not empty
   - [x] Calls `fetchAIResponse` with question

3. **API Call**
   - [x] `fetchAIResponse` function exists
   - [x] Makes POST request to `/api/v0/ai/ask`
   - [x] Sends correct JSON body: `{question, run_sql: true}`
   - [x] Handles response correctly
   - [x] Updates state (loading, error, response)

### Data Fetching
- [x] All dashboard endpoints called on mount
- [x] Error handling for each endpoint
- [x] Fallback data when API fails
- [x] Loading states managed

### Health Checks
- [x] Backend health check on mount
- [x] AI health check on mount
- [x] Status indicators in header

## 🐛 Debugging Features

- [x] Console logging for form submission
- [x] Console logging for API requests
- [x] Console logging for API responses
- [x] Error messages displayed to user
- [x] Troubleshooting tips in error messages

## 📋 Manual Testing Steps

### Test 1: Backend Connection
1. Start backend server: `python main.py` or `uvicorn main:app --reload`
2. Open frontend: `npm run dev`
3. Check header for "Backend: ✓ Online" indicator
4. Verify data loads without errors

### Test 2: Chatbot Submission
1. Type a question: "What was the total revenue in 2024?"
2. Click "Ask" button OR press Enter
3. Check browser console (F12) for logs:
   - Should see: "Form submitted!"
   - Should see: "Calling fetchAIResponse with: [question]"
   - Should see: "Sending AI request: [question]"
   - Should see: "Response status: 200"
4. Verify response appears in UI

### Test 3: Error Handling
1. Stop backend server
2. Try to submit a question
3. Verify error message appears
4. Check troubleshooting tips are shown

### Test 4: Empty Question
1. Clear the input field
2. Try to submit
3. Verify button is disabled
4. Verify error message if somehow submitted

## 🔍 Common Issues & Solutions

### Issue: Form not submitting
**Check:**
- Browser console for errors
- Network tab for request
- Form structure (form > input > button)

### Issue: CORS errors
**Solution:**
- Verify backend CORS is enabled
- Check `allow_origins` includes frontend URL

### Issue: 404 Not Found
**Solution:**
- Verify backend is running
- Check API_BASE_URL is correct
- Verify endpoint path matches documentation

### Issue: AI service not responding
**Solution:**
- Check AI health: `GET /api/v0/ai/health`
- Verify OpenAI API key is configured
- Check backend logs for AI errors

## ✅ Verification Checklist

- [x] All endpoints use correct paths (`/api/v0/dashboard/...`)
- [x] Response handling uses `success` and `data` wrapper
- [x] AI endpoint handles response correctly (no `data` wrapper)
- [x] Form submission prevents default behavior
- [x] Error states are handled gracefully
- [x] Loading states are shown
- [x] Health checks are performed
- [x] Console logging for debugging

## 📝 Notes

- Form structure: `<div class="fh-ai-search-bar"><form>...</form></div>`
- Submit handler: `handleAIQuestionSubmit` prevents default and calls `fetchAIResponse`
- API response: Dashboard endpoints wrap in `{success, data}`, AI endpoint returns directly
- Health checks: Performed on component mount, status shown in header






