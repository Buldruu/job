import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding:'24px 16px', maxWidth:520, margin:'40px auto', background:'#FEF2F2', border:'2px solid #FCA5A5', borderRadius:14 }}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", color:'#DC2626', fontSize:18, margin:'0 0 12px' }}>
            ⚠️ Алдаа гарлаа
          </h2>
          <pre style={{ background:'#FFFFFF', padding:12, borderRadius:8, fontSize:11, color:'#991B1B', overflow:'auto', whiteSpace:'pre-wrap', wordBreak:'break-word', margin:'0 0 12px', border:'1px solid #FCA5A5' }}>
            {this.state.error?.toString() || 'Unknown error'}
          </pre>
          {this.state.info?.componentStack && (
            <details style={{ marginBottom:12 }}>
              <summary style={{ fontSize:12, color:'#7F1D1D', cursor:'pointer' }}>Дэлгэрэнгүй stack trace</summary>
              <pre style={{ background:'#FFFFFF', padding:12, borderRadius:8, fontSize:10, color:'#7F1D1D', overflow:'auto', whiteSpace:'pre-wrap', marginTop:8, border:'1px solid #FCA5A5' }}>
                {this.state.info.componentStack}
              </pre>
            </details>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { this.setState({ hasError:false, error:null, info:null }); }}
              style={{ flex:1, padding:'10px', background:'#FFFFFF', color:'#DC2626', border:'1.5px solid #FCA5A5', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer' }}>
              Дахин оролдох
            </button>
            <button onClick={() => { window.location.href = '/job/'; }}
              style={{ flex:1, padding:'10px', background:'#DC2626', color:'#FFFFFF', border:'none', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer' }}>
              Нүүр рүү буцах
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
