import React from 'react';
import { ReportData } from '../types';
import { getTossIconUrl } from '../lib/tossThemeIcons';

interface Props {
  data: ReportData;
}

/**
 * 장전리포트 프리뷰 — 프리미엄 다크/라이트 혼합 디자인
 * 2페이지 구성:
 *  P1: 헤더 + 글로벌 지표 + 미증시 섹터 트렌드 + 핵심 테마 + 국내 연관 섹터
 *  P2: 미증시 분석 + 국내 특징 + 금일 전략 + 전문가 브리핑 + 일정
 */
export default function MorningPreview({ data }: Props) {

  const trendColor = (trend: string) =>
    trend === 'up' ? '#ef4444' : trend === 'down' ? '#3b82f6' : '#94a3b8';
  const trendBg = (trend: string) =>
    trend === 'up' ? 'rgba(239,68,68,0.08)' : trend === 'down' ? 'rgba(59,130,246,0.08)' : 'rgba(148,163,184,0.08)';
  const trendArrow = (trend: string) =>
    trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—';
  const sentimentColor = (s: string) =>
    s === '긍정' || s === '강세' ? '#10b981' :
    s === '부정' || s === '약세' ? '#ef4444' : '#f59e0b';
  const sentimentBg = (s: string) =>
    s === '긍정' || s === '강세' ? 'rgba(16,185,129,0.08)' :
    s === '부정' || s === '약세' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)';
  const sentimentBgSolid = (s: string) =>
    s === '긍정' || s === '강세' ? '#ecfdf5' :
    s === '부정' || s === '약세' ? '#fef2f2' : '#fffbeb';
  const sentimentEmoji = (s: string) =>
    s === '긍정' || s === '강세' ? '🟢' :
    s === '부정' || s === '약세' ? '🔴' : '🟡';

  const accentColor = data.headerLineColor || '#3b82f6';
  const badgeColor = data.headerBadgeColor || '#3b82f6';

  const pageStyle: React.CSSProperties = {
    width: 800, minHeight: 1131,
    background: '#ffffff',
    fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, sans-serif',
    position: 'relative',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    borderRadius: 12, overflow: 'hidden',
  };

  return (
    <div id="report-content" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

      {/* ===================== PAGE 1 ===================== */}
      <div style={pageStyle}>
        {/* 그라데이션 상단 바 */}
        <div style={{
          height: 6,
          background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, #ec4899)`,
        }} />

        {/* 헤더 */}
        <div style={{
          padding: '28px 40px 20px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `linear-gradient(135deg, ${badgeColor}, ${badgeColor}dd)`,
                color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 14px',
                borderRadius: 20, letterSpacing: 1.5, marginBottom: 10,
                boxShadow: `0 2px 8px ${badgeColor}40`,
              }}>
                🌅 MORNING REPORT
              </div>
              <h1 style={{
                fontSize: 28, fontWeight: 900, color: '#0f172a',
                margin: '6px 0 4px', letterSpacing: -0.8,
                background: 'linear-gradient(135deg, #0f172a, #334155)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {data.title || 'RISING STOCK 장전 시황'}
              </h1>
              <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{data.date}</p>
            </div>
            <div style={{ textAlign: 'right', paddingTop: 4 }}>
              <p style={{ fontSize: 10, color: '#cbd5e1', letterSpacing: 1 }}>POWERED BY</p>
              <p style={{
                fontSize: 18, fontWeight: 900, letterSpacing: -0.5,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>RISING STOCK</p>
            </div>
          </div>
        </div>

        {/* ── 글로벌 지표 ── */}
        <div style={{ padding: '24px 40px 0' }}>
          <SectionHeader title={data.summaryTitle || '미국 증시 및 글로벌 지표'} emoji="📊" color={accentColor} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(data.summaryItems.length, 5)}, 1fr)`,
            gap: 8, marginTop: 14,
          }}>
            {data.summaryItems.map((item, i) => (
              <div key={i} style={{
                background: data.indicatorBoxColor || '#f8fafc',
                borderRadius: 10, padding: '16px 12px', textAlign: 'center',
                border: `1px solid ${trendBg(item.trend) === 'rgba(148,163,184,0.08)' ? '#e2e8f0' : trendColor(item.trend) + '15'}`,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* 상단 미니 악센트 */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: trendColor(item.trend), opacity: 0.6,
                }} />
                <p style={{
                  fontSize: data.indicatorLabelSize || 10,
                  color: data.indicatorLabelColor || '#94a3b8',
                  fontWeight: 700, marginBottom: 6, letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>{item.label}</p>
                <p style={{
                  fontSize: data.indicatorValueSize || 22,
                  fontWeight: 900, color: data.indicatorValueColor || '#0f172a',
                  letterSpacing: -0.5,
                }}>{item.value}</p>
                <p style={{
                  fontSize: data.indicatorChangeSize || 12,
                  fontWeight: 700, color: trendColor(item.trend),
                  marginTop: 4, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 3,
                }}>
                  <span style={{ fontSize: 8 }}>{trendArrow(item.trend)}</span>
                  {item.subText}
                </p>
              </div>
            ))}
          </div>

          {/* 보조 지표 */}
          {data.subIndicators && data.subIndicators.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: `repeat(${data.subIndicators.length}, 1fr)`,
              gap: 8, marginTop: 8,
            }}>
              {data.subIndicators.map((item, i) => (
                <div key={i} style={{
                  background: '#f1f5f9', borderRadius: 8, padding: '10px 12px',
                  textAlign: 'center', border: '1px solid #e2e8f0',
                }}>
                  <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5 }}>{item.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>{item.value}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: trendColor(item.trend), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <span style={{ fontSize: 7 }}>{trendArrow(item.trend)}</span>{item.subText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 핵심 시황 ── */}
        {data.currentMarketView && (
          <div style={{ padding: '18px 40px 0' }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #f0fdf4, #fefce8)',
              borderRadius: 10, padding: '16px 18px',
              border: '1px solid #bfdbfe',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                background: `linear-gradient(180deg, ${accentColor}, #10b981)`,
              }} />
              <p style={{ fontSize: 11, fontWeight: 800, color: accentColor, marginBottom: 6, letterSpacing: 0.5, paddingLeft: 8 }}>
                💡 {data.coreViewTitle || '모닝 핵심 시황'}
              </p>
              <p style={{ fontSize: 12.5, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-line', paddingLeft: 8, fontWeight: 500 }}>
                {data.currentMarketView}
              </p>
            </div>
          </div>
        )}

        {/* ── 미증시 섹터 트렌드 ── */}
        {data.usSectors && data.usSectors.length > 0 && (
          <div style={{ padding: '22px 40px 0' }}>
            <SectionHeader title={data.usSectorsTitle || '전일 미증시 섹터 트렌드'} emoji="🌐" color={data.sectorTrendHeaderColor || accentColor} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              {data.usSectors.map((sector, i) => (
                <div key={sector.id || i} style={{
                  background: sentimentBgSolid(sector.sentiment),
                  borderRadius: 10, padding: '14px 16px',
                  borderLeft: `4px solid ${sentimentColor(sector.sentiment)}`,
                  transition: 'transform 0.15s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{
                      fontSize: data.sectorTrendNameSize || 13, fontWeight: 800, color: '#0f172a',
                    }}>{sector.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: sentimentColor(sector.sentiment),
                      background: '#fff', padding: '2px 10px', borderRadius: 12,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}>{sentimentEmoji(sector.sentiment)} {sector.sentiment}</span>
                  </div>
                  <p style={{
                    fontSize: data.sectorTrendIssueSize || 11,
                    color: '#475569', lineHeight: 1.6, marginBottom: 8,
                  }}>{sector.issue}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {sector.stocks.split(',').filter(Boolean).map((s, j) => (
                      <span key={j} style={{
                        fontSize: 10, background: '#fff', padding: '3px 10px',
                        borderRadius: 6, color: '#334155', fontWeight: 600,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        border: '1px solid #e2e8f0',
                      }}>{s.trim()}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 오늘의 핵심 테마 ── */}
        <div style={{ padding: '22px 40px 0' }}>
          <SectionHeader title={data.featuredStocksTitle || '오늘의 주요 핵심 테마'} emoji="🔥" color={data.themeHeaderColor || '#f59e0b'} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            {data.featuredStocks.map((theme, i) => {
              const iconUrl = getTossIconUrl(theme.keyword);
              const isNeg = theme.sentiment === '약세' || theme.sentiment === '부정';
              return (
                <div key={theme.id || i} style={{
                  background: '#fff', borderRadius: 10, padding: '14px 16px',
                  border: `1px solid ${isNeg ? '#fecaca' : '#e2e8f0'}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    {iconUrl ? (
                      <img src={iconUrl} alt="" style={{
                        width: 36, height: 36, borderRadius: 8,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: isNeg ? '#fef2f2' : '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                      }}>{isNeg ? '📉' : '📈'}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: data.themeNameSize || 14, fontWeight: 800, color: '#0f172a',
                      }}>{theme.keyword}</span>
                      {theme.sentiment && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, marginLeft: 8,
                          color: isNeg ? '#ef4444' : '#10b981',
                          background: isNeg ? '#fef2f2' : '#ecfdf5',
                          padding: '2px 8px', borderRadius: 10,
                        }}>{isNeg ? '▼' : '▲'} {theme.sentiment}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {theme.stocks.filter(s => s.name).map((stock, j) => (
                      <div key={j} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: '#f8fafc', borderRadius: 6, padding: '6px 10px',
                      }}>
                        <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{stock.name}</span>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{stock.price}</span>
                          <span style={{
                            fontSize: 12, fontWeight: 800,
                            color: stock.change.startsWith('-') ? '#3b82f6' : '#ef4444',
                          }}>{stock.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 국내 연관 섹터 ── */}
        {data.sectors.length > 0 && data.sectors.some(s => s.name && s.name !== '새 섹터') && (
          <div style={{ padding: '22px 40px 0' }}>
            <SectionHeader title={data.sectorsTitle || '국내 연관 섹터 전망'} emoji="🇰🇷" color={accentColor} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {data.sectors.filter(s => s.name && s.name !== '새 섹터').map((sector, i) => {
                const iconUrl = getTossIconUrl(sector.name);
                return (
                  <div key={sector.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#f8fafc', borderRadius: 10, padding: '12px 16px',
                    borderLeft: `4px solid ${sentimentColor(sector.sentiment)}`,
                    border: '1px solid #e2e8f0',
                    borderLeftWidth: 4, borderLeftColor: sentimentColor(sector.sentiment),
                  }}>
                    {iconUrl ? (
                      <img src={iconUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, background: sentimentBg(sector.sentiment),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>{sentimentEmoji(sector.sentiment)}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{sector.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: sentimentColor(sector.sentiment),
                          background: sentimentBgSolid(sector.sentiment),
                          padding: '1px 8px', borderRadius: 10,
                        }}>{sentimentEmoji(sector.sentiment)} {sector.sentiment}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>{sector.issue}</p>
                    </div>
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: 3,
                      alignItems: 'flex-end', minWidth: 120,
                    }}>
                      {sector.stocks.split(',').filter(Boolean).slice(0, 3).map((s, j) => (
                        <span key={j} style={{
                          fontSize: 10, background: '#e2e8f0', padding: '2px 10px',
                          borderRadius: 6, color: '#334155', fontWeight: 600,
                        }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <PageFooter page={1} data={data} />
      </div>

      {/* ===================== PAGE 2 ===================== */}
      <div style={pageStyle}>
        <div style={{
          height: 6,
          background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, #ec4899)`,
        }} />

        {/* 미니 헤더 */}
        <div style={{
          padding: '16px 40px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid #f1f5f9',
        }}>
          <p style={{
            fontSize: 14, fontWeight: 800, color: '#0f172a',
          }}>{data.title || 'RISING STOCK 장전 시황'}</p>
          <p style={{ fontSize: 11, color: '#94a3b8' }}>{data.date}</p>
        </div>

        {/* ── 전일 미증시 마감 분석 ── */}
        {data.usMarketAnalysis && (
          <div style={{ padding: '24px 40px 0' }}>
            <SectionHeader title={data.usMarketAnalysisTitle || '전일 미증시 마감 분석'} emoji="🇺🇸" color={data.usAnalysisHeaderColor || accentColor} />
            <div style={{
              background: data.usAnalysisBoxColor || '#f8fafc',
              borderRadius: 10, padding: '18px 20px', marginTop: 14,
              border: '1px solid #e2e8f0',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                background: data.usAnalysisHeaderColor || accentColor,
              }} />
              <p style={{
                fontSize: data.usAnalysisTextSize || 12.5,
                color: data.usAnalysisTextColor || '#334155',
                lineHeight: 1.9, whiteSpace: 'pre-line', paddingLeft: 8,
              }}>{data.usMarketAnalysis}</p>
            </div>
          </div>
        )}

        {/* ── 전일 국내증시 특징 ── */}
        {data.domesticAnalysis && (
          <div style={{ padding: '22px 40px 0' }}>
            <SectionHeader title={data.domesticAnalysisTitle || '전일 국내증시 특징'} emoji="🏠" color={accentColor} />
            <div style={{
              background: '#f8fafc', borderRadius: 10, padding: '18px 20px',
              marginTop: 14, border: '1px solid #e2e8f0',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                background: '#10b981',
              }} />
              <p style={{
                fontSize: data.domesticTextSize || 12.5,
                color: data.domesticTextColor || '#334155',
                lineHeight: 1.9, whiteSpace: 'pre-line', paddingLeft: 8,
              }}>{data.domesticAnalysis}</p>
            </div>
          </div>
        )}

        {/* ── 금일 시장전략 ── */}
        {data.todayStrategy && (
          <div style={{ padding: '22px 40px 0' }}>
            <SectionHeader title={data.todayStrategyTitle || '금일 시장전략'} emoji="⚡" color="#f59e0b" />
            <div style={{
              background: 'linear-gradient(135deg, #fefce8, #fffbeb, #fef3c7)',
              borderRadius: 10, padding: '20px 22px', marginTop: 14,
              border: '1px solid #fde68a',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                background: 'linear-gradient(180deg, #f59e0b, #d97706)',
              }} />
              <p style={{
                fontSize: data.strategyTextSize || 13,
                color: data.strategyTextColor || '#1e293b',
                lineHeight: 1.9, whiteSpace: 'pre-line', fontWeight: 500, paddingLeft: 8,
              }}>{data.todayStrategy}</p>
              {data.expertInterestedStocks && (
                <div style={{
                  marginTop: 16, paddingTop: 12,
                  borderTop: '1px dashed #fbbf24',
                }}>
                  <p style={{ fontSize: 11, color: '#92400e', fontWeight: 800, marginBottom: 6, paddingLeft: 8 }}>
                    📌 관심 종목
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 8 }}>
                    {data.expertInterestedStocks.split(',').filter(Boolean).map((s, i) => (
                      <span key={i} style={{
                        fontSize: 11, background: '#fff',
                        padding: '4px 12px', borderRadius: 20, color: '#92400e',
                        fontWeight: 700, border: '1px solid #fde68a',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 일정 ── */}
        {data.marketSchedule.length > 0 && data.marketSchedule.some(s => s.event) && (
          <div style={{ padding: '22px 40px 0' }}>
            <SectionHeader title={data.scheduleTitle || '금일 주요 일정'} emoji="📅" color={accentColor} />
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.marketSchedule.filter(s => s.event).map((s, i) => (
                <div key={s.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: '#f8fafc', borderRadius: 8, padding: '10px 16px',
                  border: '1px solid #e2e8f0',
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: accentColor,
                    background: `${accentColor}10`, padding: '3px 12px', borderRadius: 6,
                    minWidth: 56, textAlign: 'center',
                    border: `1px solid ${accentColor}20`,
                  }}>{s.time}</span>
                  <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500 }}>{s.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 전문가 브리핑 ── */}
        {data.expertAnalysis && (
          <div style={{ padding: '22px 40px 0' }}>
            <SectionHeader title={data.expertAnalysisTitle || 'RISING STOCK 모닝 브리핑'} emoji="💬" color={accentColor} />
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              borderRadius: 12, padding: '22px 24px', marginTop: 14,
              boxShadow: '0 4px 16px rgba(15,23,42,0.3)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* 데코 */}
              <div style={{
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                borderRadius: '50%', background: `${accentColor}15`,
              }} />
              <div style={{
                position: 'absolute', bottom: -30, left: -30, width: 100, height: 100,
                borderRadius: '50%', background: '#8b5cf610',
              }} />
              <p style={{
                fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 8,
                letterSpacing: 1, textTransform: 'uppercase',
              }}>
                {data.expertAnalysisSubtitle || '개장 전 투자 전략'}
              </p>
              <p style={{
                fontSize: 13, lineHeight: 1.9, whiteSpace: 'pre-line',
                color: '#e2e8f0', position: 'relative',
              }}>{data.expertAnalysis}</p>
            </div>
          </div>
        )}

        <PageFooter page={2} data={data} />
      </div>
    </div>
  );
}

// ─── 섹션 헤더 ───
function SectionHeader({ title, emoji, color }: { title: string; emoji: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: `${color}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, border: `1px solid ${color}20`,
      }}>{emoji}</div>
      <h2 style={{
        fontSize: 16, fontWeight: 900, color: '#0f172a',
        letterSpacing: -0.3,
      }}>{title}</h2>
    </div>
  );
}

// ─── 푸터 ───
function PageFooter({ page, data }: { page: number; data: ReportData }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '14px 40px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderTop: '1px solid #f1f5f9',
      background: '#fafbfc',
    }}>
      <p style={{
        fontSize: data.disclaimerTextSize || 9,
        color: data.disclaimerTextColor || '#cbd5e1',
      }}>
        본 자료는 투자 참고용이며, 투자 판단의 책임은 투자자 본인에게 있습니다.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 9, color: '#cbd5e1' }}>RISING STOCK</span>
        <span style={{
          fontSize: data.pageNumberSize || 11,
          color: data.pageNumberColor || '#94a3b8',
          fontWeight: 800,
          background: '#f1f5f9', padding: '2px 10px', borderRadius: 6,
        }}>{page} / 2</span>
      </div>
    </div>
  );
}
