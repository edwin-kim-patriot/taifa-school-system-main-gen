export const submitScores = async (scores) => {
    const response = await fetch('/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scores),
    });
  
    if (!response.ok) {
      throw new Error('Failed to submit scores');
    }
  
    return response.json();
  };
  