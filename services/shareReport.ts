import { supabase } from './supabase';
import { ReportData } from '../types';

export interface SharedReport {
  id: string;
  report_data: ReportData;
  title: string;
  report_type: string;
  dark_mode: boolean;
  created_at: string;
}

/** 리포트를 Supabase에 저장하고 공유 ID 반환 */
export const publishReport = async (
  data: ReportData,
  darkMode: boolean
): Promise<string> => {
  const { data: result, error } = await supabase
    .from('shared_reports')
    .insert({
      report_data: data,
      title: data.title,
      report_type: data.reportType,
      dark_mode: darkMode,
    })
    .select('id')
    .single();

  if (error) throw new Error(`공유 실패: ${error.message}`);
  return result.id;
};

/** 공유 ID로 리포트 데이터 조회 */
export const getSharedReport = async (id: string): Promise<SharedReport | null> => {
  const { data, error } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as SharedReport;
};
