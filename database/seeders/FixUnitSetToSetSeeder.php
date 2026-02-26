<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FixUnitSetToSetSeeder extends Seeder
{
    public function run(): void
    {
        $skus = [
            'BP891841','BP199808','BP403142','BP469251','BP349974','BP486830','BP223550',
            'BP693219','BP726194','BP508335','BP895123','BP584244','BP971677','BP730859',
            'BP103002','BP221520','BP849580','BP188992','BP325526','BP941929','BP511920',
            'BP123642','BP916320','BP883013','BP874751','BP179816','BP360253','BP426684',
            'BP330304','BP717092','BP155597','Z4K5417','BP666484','BP455539','BP845230',
            'BP516613','BP124617','BP690227','BP898194','BP199593','BP806690','BP148360',
            'BP355631','BP925231','BP987674','BP799453','BP497041','BP647966','BP866738',
            'BP689108','BP211654','BP600184','BP960167','BP229799','BP713495','BP504311',
            'BP201577','BP585380','BP171628','BP290425','BP730386','BP590367','BP529741',
            'BP418240','BP734206','BP822076','BP672280','BP404081','BP972564','BP129120',
            'BP993143','BP150021','BP169697','BP556807','BP643683','BP462487','BP348728',
            'BP706131','BP566111','BP590624','BP709098','BP169404','BP471467','BP589986',
            'BP880189','BP448082','BP955969','BP842210','BP867046','BP354156','BP743202',
            'BP348626','BP333449','BP940268','BP512195','BP900444','BP894105','BP532393',
            'BP737458','BP159428','BP463142','BP887946','BP853804','BP764103','BP369850',
        ];

        // (Opcional) Normaliza: quita espacios y pasa a mayúsculas
        $skus = array_values(array_unique(array_map(fn($s) => strtoupper(trim($s)), $skus)));

        $updated = 0;

        // Por si son muchos, hacemos chunks
        foreach (array_chunk($skus, 500) as $chunk) {
            $updated += DB::table('inventory_items')
                ->whereIn('sku', $chunk)
                ->update(['unit_set' => 'SET']);
        }

        $found = DB::table('inventory_items')->whereIn('sku', $skus)->count();
        $missing = count($skus) - $found;

        $this->command?->info("✅ unit_set='SET' aplicado. Filas actualizadas: {$updated}");
        $this->command?->warn("🔎 SKUs en lista: " . count($skus) . " | encontrados: {$found} | faltantes: {$missing}");
    }
}
